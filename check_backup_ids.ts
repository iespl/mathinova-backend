import fs from 'fs';

const backupPath = 'f:\\mathinova_backup_full_2026-03-12T09-28-29.json';

try {
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log('--- Backup ID Map ---');
    console.log('Courses:');
    if (data.course) {
        data.course.forEach((c: any) => console.log(` - [${c.id}] ${c.title}`));
    }

    console.log('\nModules:');
    if (data.module) {
        data.module.slice(0, 10).forEach((m: any) => console.log(` - [${m.id}] ${m.title} (Course: ${m.courseId})`));
    }

    console.log('\nLessons:');
    if (data.lesson) {
        data.lesson.slice(0, 10).forEach((l: any) => console.log(` - [${l.id}] ${l.title} (Module: ${l.moduleId})`));
    }
} catch (err) {
    console.error(err);
}
