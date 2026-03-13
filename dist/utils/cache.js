class InMemoryCache {
    cache;
    maxSize;
    defaultTTL;
    cleanupInterval;
    constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
        this.cleanupInterval = null;
        this.startCleanup();
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        // Update last accessed time for LRU
        entry.lastAccessed = Date.now();
        return entry.value;
    }
    set(key, value, ttl) {
        const expiresAt = Date.now() + (ttl || this.defaultTTL);
        // If cache is at max size, evict LRU entry
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }
        this.cache.set(key, {
            value,
            expiresAt,
            lastAccessed: Date.now()
        });
    }
    invalidate(key) {
        this.cache.delete(key);
    }
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }
    clear() {
        this.cache.clear();
    }
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
    startCleanup() {
        // Run cleanup every 60 seconds
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            const keysToDelete = [];
            for (const [key, entry] of this.cache.entries()) {
                if (now > entry.expiresAt) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.cache.delete(key));
        }, 60 * 1000);
    }
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    // For testing/monitoring
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            keys: Array.from(this.cache.keys())
        };
    }
}
// Singleton instance
const cache = new InMemoryCache();
export default cache;
//# sourceMappingURL=cache.js.map