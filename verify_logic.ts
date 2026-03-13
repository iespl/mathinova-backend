
import { StudentService } from './src/services/studentService.js';
import prisma from './src/utils/prisma.js';

async function verifyProgressLogic() {
    const userId = 'test-user-uuid';
    const lessonId = 'lesson-uuid-1'; // From manifest
    const videoIds = ['video-uuid-1', 'video-uuid-2', 'video-uuid-3'];

    console.log('--- Starting Verification ---');

    // 1. Reset Progress
    await prisma.progress.deleteMany({ where: { userId, lessonId } });
    console.log('1. Progress reset.');

    // 2. Watch 2/3 videos
    await StudentService.updateVideoProgress(userId, lessonId, videoIds[0], 600);
    await StudentService.updateVideoProgress(userId, lessonId, videoIds[1], 600);
    let p = await prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
    console.log(`2. Watched 2 videos. lessonCompleted: ${p?.lessonCompleted} (Expected: false)`);

    // 3. Watch 3rd video
    await StudentService.updateVideoProgress(userId, lessonId, videoIds[2], 600);
    p = await prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
    console.log(`3. Watched ALL videos. lessonCompleted: ${p?.lessonCompleted} (Expected: false - missing quiz)`);

    // 4. Attempt Quiz
    await StudentService.recordQuizAttempt(userId, lessonId);
    p = await prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId } } });
    console.log(`4. Attempted Quiz. lessonCompleted: ${p?.lessonCompleted} (Expected: true)`);

    if (p?.lessonCompleted === true) {
        console.log('✅ BACKEND LOGIC VERIFIED');
    } else {
        console.error('❌ VERIFICATION FAILED');
    }
}

verifyProgressLogic()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
