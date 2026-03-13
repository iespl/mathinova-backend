import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testReorder() {
    console.log("Starting test...");
    
    // 1. Get a course with lessons
    const course = await prisma.course.findFirst({
        include: {
            modules: {
                include: {
                    lessons: {
                        include: {
                            pyqs: {
                                orderBy: { order: 'asc' }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!course) {
        console.log("No course found.");
        return;
    }

    // Find a lesson with multiple PYQs
    let targetLesson = null;
    for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
            if (lesson.pyqs.length >= 2) {
                targetLesson = lesson;
                break;
            }
        }
        if (targetLesson) break;
    }

    if (!targetLesson) {
        console.log("No lesson found with multiple PYQs.");
        return;
    }

    console.log(`Found lesson: ${targetLesson.title} with ${targetLesson.pyqs.length} PYQs`);
    const originalPyqs = targetLesson.pyqs.map(p => ({ id: p.id, order: p.order }));
    console.log("Original order:");
    console.table(originalPyqs);

    // 2. Simulate dragging: swap the first two
    console.log("Simulating drag and drop to swap the first two PYQs...");
    const reorderedPyqs = [...targetLesson.pyqs];
    const temp = reorderedPyqs[0];
    reorderedPyqs[0] = reorderedPyqs[1];
    reorderedPyqs[1] = temp;
    
    // Reassign order indices as arrayMove + map would do in the frontend
    const newOrderPyqs = reorderedPyqs.map((p, idx) => ({ ...p, order: idx }));
    console.log("Expected new order:");
    console.table(newOrderPyqs.map(p => ({ id: p.id, order: p.order })));

    // 3. Call updateLessonContent logic exactly as it is in the service
    console.log("Saving new order using AdminService logic...");
    
    // Simulate AdminService.updateLessonContent transaction part for PYQs
    await prisma.$transaction(async (tx) => {
        const pyqPromises = newOrderPyqs.map((p, idx) => {
            const orderValue = p.order !== undefined ? p.order : idx;
            
            if (p.id) {
                return tx.pYQ.update({
                    where: { id: p.id },
                    data: {
                        order: orderValue,
                    }
                });
            }
        });
        await Promise.all(pyqPromises);
    }, {
        timeout: 120000
    });

    // 4. Refetch it using the exact structure as getCourseById
    const refetchedCourse = await prisma.course.findUnique({
        where: { id: course.id },
        include: {
            modules: {
                include: {
                    lessons: {
                        include: {
                            pyqs: {
                                orderBy: { order: 'asc' }
                            }
                        }
                    }
                }
            }
        }
    });

    let refetchedLesson = null;
    if (refetchedCourse) {
        for (const mod of refetchedCourse.modules) {
            for (const lesson of mod.lessons) {
                if (lesson.id === targetLesson.id) {
                    refetchedLesson = lesson;
                    break;
                }
            }
        }
    }

    console.log("Refetched order from database:");
    if (refetchedLesson) {
        console.table(refetchedLesson.pyqs.map(p => ({ id: p.id, order: p.order })));
        
        // Assert
        const pass = refetchedLesson.pyqs[0].id === newOrderPyqs[0].id && refetchedLesson.pyqs[1].id === newOrderPyqs[1].id;
        console.log(pass ? "✅ TEST PASSED: Database correctly saved and sorted by the new order." : "❌ TEST FAILED: Order did not match expected layout.");
    } else {
        console.log("Error: Could not refetch lesson.");
    }
}

testReorder().catch(console.error).finally(() => prisma.$disconnect());
