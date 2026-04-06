const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();

  // Desktop 1280x800
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageD = await desktop.newPage();
  await pageD.goto('http://localhost:5173/');
  await pageD.waitForTimeout(3000); // wait for Leaflet tiles
  await pageD.screenshot({ path: '/Users/niannian/seoul/screenshots/desktop.png', fullPage: false });
  await desktop.close();

  // Mobile 375x812
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
  const pageM = await mobile.newPage();
  await pageM.goto('http://localhost:5173/');
  await pageM.waitForTimeout(3000); // wait for Leaflet tiles
  await pageM.screenshot({ path: '/Users/niannian/seoul/screenshots/mobile.png', fullPage: false });
  await mobile.close();

  await browser.close();
})();
