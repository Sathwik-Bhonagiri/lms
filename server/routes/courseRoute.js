import express from 'express';
import { getAllCourses, getCourseId } from '../controllers/courseController.js';

const router = express.Router();

router.get('/all', async (req, res, next) => {
  try {
    await getAllCourses(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    await getCourseId(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;