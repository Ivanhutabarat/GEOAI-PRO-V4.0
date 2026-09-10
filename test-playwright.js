import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshot.png' });
  
  // Also dump HTML body
  const body = await page.evaluate(() => document.body.innerHTML);
  console.log("HTML:", body.substring(0, 1000));
  
  console.log("Done checking.");
  await browser.close();
})();
