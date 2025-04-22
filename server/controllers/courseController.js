
import Course from "../models/Course.js";



export const getAllCourses = async(req,res)=>{
    try {
        const courses = await Course.find({isPublished:true}).select(['-courseContent','-enrolledStudents'])
        .populate({path:'educator'})

        res.json({success:true,courses})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}
export const getCourseId = async(req,res)=>{
    const {id} = req.params
    try {
        const courseData = await Course.findById(id).populate({path:'educator'})
        courseData.courseContent.forEach(chapter=>{
            chapter.chapterContent.forEach(lecture=>{
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = "";
                }
            })
        })
        res.json({success:true,courseData})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const verifyPurchase = async (req, res, next) => {
    try {
      const purchase = await Purchase.findOne({
        userId: req.user._id,
        courseId: req.params.courseId,
        status: 'completed'
      });
      
      if (!purchase) {
        return res.status(403).json({ 
          success: false,
          message: "Purchase required to rate this course"
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };



