import { CourseService } from './services/courseService.js';
async function benchmark() {
    const slug = 'structural-engineering-theory-practice';
    console.log(`Benchmarking getCourseBySlug for: ${slug}`);
    const start = performance.now();
    const course = await CourseService.getCourseBySlug(slug);
    const end = performance.now();
    if (course) {
        console.log(`Success! Title: ${course.title}`);
        console.log(`\n=== PERFORMANCE METRIC ===`);
        console.log(`Time taken: ${(end - start).toFixed(2)}ms`);
        console.log(`==========================\n`);
        console.log(`Counts:`, course._counts);
    }
    else {
        console.log('Course not found');
    }
}
benchmark()
    .catch(console.error)
    .finally(() => process.exit(0));
//# sourceMappingURL=benchmark.js.map