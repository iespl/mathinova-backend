import { Router } from 'express';
import { BlogController } from '../controllers/blogController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', BlogController.getPublishedBlogs);
router.get('/:slug', BlogController.getBlogBySlug);

// Admin routes (Protected)
router.get('/admin/all', authenticate, authorize([Role.admin, Role.super_admin]), BlogController.getAllBlogsAdmin);
router.post('/admin', authenticate, authorize([Role.admin, Role.super_admin]), BlogController.createBlog);
router.put('/admin/:id', authenticate, authorize([Role.admin, Role.super_admin]), BlogController.updateBlog);
router.delete('/admin/:id', authenticate, authorize([Role.admin, Role.super_admin]), BlogController.deleteBlog);

export default router;
