import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQ FAIL:', request.url(), request.failure()?.errorText));
    
    console.log('Navigating to course page...');
    await page.goto('http://localhost:5173/course/vtu---mathkit-bmatc101', { waitUntil: 'networkidle0' });
    console.log('Navigation complete');
    
    await browser.close();
})();
