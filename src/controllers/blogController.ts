import { Request, Response } from 'express';
import { BlogService } from '../services/blogService.js';
import { AuthRequest } from '../middlewares/auth.js';

export class BlogController {
    // --- Public Endpoints ---

    static async getPublishedBlogs(req: Request, res: Response) {
        try {
            const blogs = await BlogService.getPublishedBlogs();
            res.json(blogs);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getBlogBySlug(req: Request, res: Response) {
        try {
            const blog = await BlogService.getBlogBySlug(req.params.slug as string);
            if (!blog) return res.status(404).json({ message: 'Blog post not found' });
            res.json(blog);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // --- Admin Endpoints ---

    static async getAllBlogsAdmin(req: Request, res: Response) {
        try {
            const blogs = await BlogService.getAllBlogsForAdmin();
            res.json(blogs);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async createBlog(req: Request, res: Response) {
        try {
            const adminId = (req as AuthRequest).user!.id;
            const blog = await BlogService.createBlog(adminId, req.body);
            res.status(201).json(blog);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async updateBlog(req: Request, res: Response) {
        try {
            const adminId = (req as AuthRequest).user!.id;
            const blog = await BlogService.updateBlog(adminId, req.params.id as string, req.body);
            res.json(blog);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async deleteBlog(req: Request, res: Response) {
        try {
            const adminId = (req as AuthRequest).user!.id;
            await BlogService.deleteBlog(adminId, req.params.id as string);
            res.json({ message: 'Blog post deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
