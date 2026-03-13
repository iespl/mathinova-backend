export declare class AuditService {
    /**
     * Records an administrative action with optional state snapshots.
     */
    static logAction(data: {
        actorUserId: string;
        action: string;
        entityType: string;
        entityId: string;
        beforeState?: any;
        afterState?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        beforeState: import("@prisma/client/runtime/library").JsonValue | null;
        afterState: import("@prisma/client/runtime/library").JsonValue | null;
        actorUserId: string;
    }>;
}
