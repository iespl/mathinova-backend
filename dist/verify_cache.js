import { CourseService } from './services/courseService.js';
import cache from './utils/cache.js';
async function benchmark() {
    const slug = 'structural-engineering-theory-practice';
    console.log('=== CACHE PERFORMANCE TEST ===\n');
    // Test 1: Cold request (cache miss)
    console.log('Test 1: Cold Request (Cache Miss)');
    cache.clear();
    const start1 = performance.now();
    const course1 = await CourseService.getPublicCourseBySlug(slug);
    const end1 = performance.now();
    console.log(`Time: ${(end1 - start1).toFixed(2)}ms`);
    console.log(`Cache stats:`, cache.getStats());
    // Simulate caching
    const cacheKey = `public:course:${slug}`;
    cache.set(cacheKey, course1);
    // Test 2: Warm request (cache hit)
    console.log('\nTest 2: Warm Request (Cache Hit)');
    const start2 = performance.now();
    const cached = cache.get(cacheKey);
    const end2 = performance.now();
    console.log(`Time: ${(end2 - start2).toFixed(2)}ms`);
    console.log(`Cache hit: ${cached !== null}`);
    // Test 3: Response size comparison
    console.log('\n=== RESPONSE SIZE COMPARISON ===\n');
    const publicCourse = course1;
    const publicPayload = JSON.stringify(publicCourse);
    const publicSize = Buffer.byteLength(publicPayload);
    console.log(`Public endpoint (sample videos only):`);
    console.log(`  Size: ${(publicSize / 1024).toFixed(2)} KB`);
    console.log(`  Characters: ${publicPayload.length}`);
    console.log(`  Sample videos in response: ${publicCourse?.modules.flatMap((m) => m.lessons).flatMap((l) => l.videos).length || 0}`);
    // Test 4: Cache eviction
    console.log('\n=== LRU EVICTION TEST ===\n');
    cache.clear();
    console.log('Adding 101 entries to test eviction...');
    for (let i = 0; i < 101; i++) {
        cache.set(`test:key:${i}`, { data: `value${i}` });
    }
    const stats = cache.getStats();
    console.log(`Cache size after 101 inserts: ${stats.size} (max: ${stats.maxSize})`);
    console.log(`LRU eviction working: ${stats.size === 100}`);
    process.exit(0);
}
benchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=verify_cache.js.map