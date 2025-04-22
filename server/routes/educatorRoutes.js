import express from 'express'
import {
  addCourse,
  getEducatorCourses,
  updateRoleToEducator
} from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protectEducator } from '../middlewares/authMiddleware.js'
import {
  educatorDashboardData,
  getEnrolledStudentsData
} from '../models/Purchase.js'

const educatorRouter = express.Router()

// Role update
educatorRouter.get('/update-role', updateRoleToEducator)

// Course management
educatorRouter.post('/add-course', protectEducator, upload.single('image'), addCourse)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)

// Dashboard data
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)

export default educatorRouter
