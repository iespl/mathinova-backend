import prisma from '../utils/prisma.js';

export class AuditService {
    /**
     * Records an administrative action with optional state snapshots.
     */
    static async logAction(data: {
        actorUserId: string;
        action: string;
        entityType: string;
        entityId: string;
        beforeState?: any;
        afterState?: any;
    }) {
        return prisma.auditLog.create({
            data: {
                actorUserId: data.actorUserId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                beforeState: data.beforeState ?? null,
                afterState: data.afterState ?? null
            }
        });
    }
}
