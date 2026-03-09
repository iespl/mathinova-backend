import { CourseService } from './services/courseService.js';
import fs from 'fs';

async function benchmark() {
    const slug = 'structural-engineering-theory-practice';
    const logFile = './benchmark_detailed_logs.txt';
    const logStream = fs.createWriteStream(logFile);

    // Redirect console.log to file
    const originalLog = console.log;
    console.log = (...args) => {
        logStream.write(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n');
        originalLog(...args);
    };

    console.log(`Benchmarking getCourseBySlug for: ${slug}`);

    const start = performance.now();
    const course = await CourseService.getCourseBySlug(slug);
    const end = performance.now();

    console.log(`\n=== PERFORMANCE METRIC ===`);
    console.log(`Time taken: ${(end - start).toFixed(2)}ms`);
    console.log(`==========================\n`);

    logStream.end();
}

benchmark()
    .catch(console.error)
    .finally(() => {
        setTimeout(() => process.exit(0), 1000);
    });
