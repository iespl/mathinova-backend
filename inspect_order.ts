import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectOrder() {
    const orderId = 'e8432afc-6501-4161-bdb7-4293714cf367'; // From previous log

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true, payments: true }
    });

    console.log('--- Order Details ---');
    console.log(order);

    if (order) {
        console.log('\n--- Enrollment Check ---');
        // Check for enrollment by Email (if userId is null) or UserId
        if (order.userId) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: order.userId,
                        courseId: order.courseId
                    }
                }
            });
            console.log('Enrollment via UserId:', enrollment);
        } else {
            console.log('Order has NO User ID linked.');
            // Check if any user has this email
            const userByEmail = await prisma.user.findUnique({
                where: { email: order.email }
            });
            console.log('User with matching email:', userByEmail);

            if (userByEmail) {
                const enrollment = await prisma.enrollment.findUnique({
                    where: {
                        userId_courseId: {
                            userId: userByEmail.id,
                            courseId: order.courseId
                        }
                    }
                });
                console.log('Enrollment via Email-matched User:', enrollment);
            }
        }
    }
}

inspectOrder()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
