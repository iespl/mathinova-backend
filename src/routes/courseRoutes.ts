import { Router } from 'express';
import { CourseController } from '../controllers/courseController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', CourseController.getAllCourses);
router.get('/branches', CourseController.listBranches);
router.get('/public/:slug', CourseController.getPublicCourseDetails);
router.get('/:slug', CourseController.getCourseDetails);

// Admin routes
router.post('/', authenticate, authorize([Role.admin, Role.super_admin]), CourseController.createCourse);
router.patch('/:id', authenticate, authorize([Role.admin, Role.super_admin]), CourseController.updateCourse);

export default router;
