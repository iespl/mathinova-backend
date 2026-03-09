import prisma from '../utils/prisma.js';
import { EntityStatus } from '@prisma/client';
import { AuditService } from './auditService.js';

export class BlogService {
    // --- Public Logic ---

    /**
     * Lists published blog posts.
     */
    static async getPublishedBlogs() {
        return prisma.blog.findMany({
            where: { status: EntityStatus.published },
            orderBy: { publishedAt: 'desc' },
            include: {
                author: {
                    select: { name: true }
                }
            }
        });
    }

    /**
     * Gets a specific published blog by slug.
     */
    static async getBlogBySlug(slug: string) {
        return prisma.blog.findFirst({
            where: {
                slug,
                status: EntityStatus.published
            },
            include: {
                author: {
                    select: { name: true }
                }
            }
        });
    }

    // --- Admin Logic ---

    /**
     * Lists all blogs for admin panel.
     */
    static async getAllBlogsForAdmin() {
        return prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { name: true }
                }
            }
        });
    }

    /**
     * Creates a new blog post.
     */
    static async createBlog(adminId: string, data: {
        title: string,
        slug: string,
        content: string,
        excerpt?: string,
        thumbnail?: string,
        category?: string,
        tags?: string[],
        videoUrl?: string,
        status?: EntityStatus
    }) {
        const blog = await prisma.blog.create({
            data: {
                ...data,
                authorId: adminId,
                publishedAt: data.status === EntityStatus.published ? new Date() : null
            }
        });

        await AuditService.logAction({
            actorUserId: adminId,
            action: 'CREATE',
            entityType: 'BLOG',
            entityId: blog.id,
            afterState: blog
        });

        const cache = (await import('../utils/cache.js')).default;
        cache.invalidate('public:blogs');

        return blog;
    }

    /**
     * Updates an existing blog post.
     */
    static async updateBlog(adminId: string, id: string, data: any) {
        const beforeState = await prisma.blog.findUnique({ where: { id } });
        if (!beforeState) throw new Error('Blog not found');

        // Handle publishedAt timestamp
        if (data.status === EntityStatus.published && beforeState.status !== EntityStatus.published) {
            data.publishedAt = new Date();
        } else if (data.status === EntityStatus.draft) {
            data.publishedAt = null;
        }

        const blog = await prisma.blog.update({
            where: { id },
            data
        });

        await AuditService.logAction({
            actorUserId: adminId,
            action: 'UPDATE',
            entityType: 'BLOG',
            entityId: id,
            beforeState,
            afterState: blog
        });

        // Invalidate cache if implemented for blogs
        const cache = (await import('../utils/cache.js')).default;
        cache.invalidate(`public:blog:${beforeState.slug}`);
        if (blog.slug !== beforeState.slug) {
            cache.invalidate(`public:blog:${blog.slug}`);
        }
        cache.invalidate('public:blogs'); // Invalidate the main collection cache

        return blog;
    }

    /**
     * Deletes a blog post.
     */
    static async deleteBlog(adminId: string, id: string) {
        const blog = await prisma.blog.findUnique({ where: { id } });
        if (!blog) throw new Error('Blog not found');

        await prisma.blog.delete({ where: { id } });

        await AuditService.logAction({
            actorUserId: adminId,
            action: 'DELETE',
            entityType: 'BLOG',
            entityId: id,
            beforeState: blog
        });

        const cache = (await import('../utils/cache.js')).default;
        cache.invalidate(`public:blog:${blog.slug}`);
        cache.invalidate('public:blogs');

        return { success: true };
    }
}
