declare class InMemoryCache {
    private cache;
    private readonly maxSize;
    private readonly defaultTTL;
    private cleanupInterval;
    constructor(maxSize?: number, defaultTTL?: number);
    get<T>(key: string): T | null;
    set<T>(key: string, value: T, ttl?: number): void;
    invalidate(key: string): void;
    invalidatePattern(pattern: string): void;
    clear(): void;
    private evictLRU;
    private startCleanup;
    stopCleanup(): void;
    getStats(): {
        size: number;
        maxSize: number;
        keys: string[];
    };
}
declare const cache: InMemoryCache;
export default cache;
