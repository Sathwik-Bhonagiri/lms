import mongoose from "mongoose";
import Course from "./Course.js";
const PurchaseSchema = new mongoose.Schema({
    courseId:{type:mongoose.Schema.Types.ObjectId,
        ref:'course',
        required:true
    },
    userId:{
        type:String,
        ref:'User',
        required:true
    },
    amount:{type:Number,required:true},
    status : {type:String,enum:['pending','completed','failed'],default:'pending'}
},{timestamps:true})

export const Purchase = mongoose.model('Purchase',PurchaseSchema)

export const educatorDashboardData = async (req,res)=>{
    try {
        const educator  = req.auth.userId;
        const courses = await Course.find({educator});
        const totalCourses = courses.length;
        const courseIds = courses.map(course=> course._id);
        const purchases = await Purchase.find({
            courseId:{$in:courseIds},
            status:'completed'
        });
        const totalEarnings = purchases.reduce((sum,purchase)=> sum+purchase.amount,0);
        const enrolledStudentsData = [];
        for(const course of courses){
            const students = await User.find({
                _id:{$in: course.enrolledStudents}
            },'name imageUrl');
            students.forEach(student =>{
                enrolledStudentsData.push({
                    courseTitle:course.courseTitle,
                    student
                });
            });
        }
        res.json({success:true,dashboardData:{
            totalEarnings,enrolledStudentsData,totalCourses
        }})
    } catch (error) {
        res.json({success:false,message:error,message})
    }
}

export const getEnrolledStudentsData = async(req,res)=>{
    try {
        const educator  = req.auth.userId;
        const courses = await Course.find({educator});
        const courseIds = courses.map(course=> course._id);
        const purchases = await Purchase.find({
            courseId:{$in: courseIds},
            status:'completed'
        }).populate('userId','name imageUrl').populate('courseId','courseTitle')
        const enrolledStudents = purchases.map(purchase=>({
            student: purchase.userId,
            courseTitle:purchase.courseId.courseTitle,
            purchaseDate : purchase.createdAt
        }));
        res.json({success:true,enrolledStudents})
    } catch (error) {
        res.json({success:false,message:error,message})
    }
}