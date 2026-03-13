import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres:postgres@localhost:5432/mathinova?schema=public";

async function seed() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        // Clean up
        await client.query('DELETE FROM "Progress"');
        await client.query('DELETE FROM "Enrollment"');
        await client.query('DELETE FROM "Payment"');
        await client.query('DELETE FROM "Order"');
        await client.query('DELETE FROM "Video"');
        await client.query('DELETE FROM "Resource"');
        await client.query('DELETE FROM "Lesson"');
        await client.query('DELETE FROM "Module"');
        await client.query('DELETE FROM "Course"');

        // Insert Course
        const courseRes = await client.query(`
      INSERT INTO "Course" (id, title, slug, description, category, "basePrice", currency, status, "createdAt")
      VALUES (gen_random_uuid(), 'Mastering Structural Mechanics', 'structural-mechanics-101', 'Deep dive into mechanics', 'Engineering', 99.99, 'USD', 'published', NOW())
      RETURNING id
    `);
        const courseId = courseRes.rows[0].id;

        // Insert Module
        const moduleRes = await client.query(`
      INSERT INTO "Module" (id, "courseId", title, "order")
      VALUES (gen_random_uuid(), $1, 'Module 1: Intro', 1)
      RETURNING id
    `, [courseId]);
        const moduleId = moduleRes.rows[0].id;

        // Insert Lesson
        const lessonRes = await client.query(`
      INSERT INTO "Lesson" (id, "moduleId", title, "order", version, "isDeleted", "updatedAt")
      VALUES (gen_random_uuid(), $1, 'Lesson 1.1: Forces', 1, 1, false, NOW())
      RETURNING id
    `, [moduleId]);
        const lessonId = lessonRes.rows[0].id;

        // Insert Video
        await client.query(`
      INSERT INTO "Video" (id, "lessonId", "videoUrl", duration)
      VALUES (gen_random_uuid(), $1, 'https://example.com/video.mp4', 600)
    `, [lessonId]);

        console.log('Seeding complete via direct SQL.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.end();
    }
}

seed();
