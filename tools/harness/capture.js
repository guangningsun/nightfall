// Capture real gameplay frames from the mini-game running in a browser harness.
const path = require('path');
const PW = require('/Users/sunguangning/clawd/node_modules/playwright');

const OUT = '/Users/sunguangning/Documents/code/codex_ws/nightfall_site/assets/shots';
const URL = 'http://127.0.0.1:8899/tools/harness/index.html';

(async () => {
  const browser = await PW.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 520, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));

  await page.goto(URL, { waitUntil: 'networkidle' });
  try {
    await page.waitForFunction('window.__ready === true', { timeout: 15000 });
  } catch (e) {
    console.log('NOT READY. errors:', errs.slice(0, 12));
    console.log('log text:', await page.textContent('#log').catch(() => '?'));
    await page.screenshot({ path: '/tmp/harness_fail.png' });
    await browser.close();
    process.exit(1);
  }
  console.log('engine ready');

  const shot = async (name) => {
    await page.evaluate(() => window.__g.draw());
    await page.waitForTimeout(120);
    const el = await page.$('#gamecanvas');
    await el.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('shot', name);
  };

  // menu
  await shot('01-menu');

  // solo combat
  await page.evaluate(() => { window.__g.test.setHero('hunter'); window.__g.start(); });
  await page.evaluate(() => { for (let i = 0; i < 60; i++) window.__g.step(0.05); });
  await shot('02-solo-hunter');

  await page.evaluate(() => { window.__g.test.setTime(180); for (let i = 0; i < 40; i++) window.__g.step(0.05); });
  await shot('03-solo-crowd');

  // mage with effects
  await page.evaluate(() => { window.__g.test.returnToMenu(); window.__g.test.setHero('mage'); window.__g.start(); });
  await page.evaluate(() => { for (let i = 0; i < 90; i++) window.__g.step(0.05); });
  await shot('04-solo-mage');

  // rogue
  await page.evaluate(() => { window.__g.test.returnToMenu(); window.__g.test.setHero('rogue'); window.__g.start(); });
  await page.evaluate(() => { for (let i = 0; i < 90; i++) window.__g.step(0.05); });
  await shot('05-solo-rogue');

  // elite encounter
  await page.evaluate(() => { window.__g.test.setTime(300); window.__g.test.spawn(false, true); for (let i = 0; i < 30; i++) window.__g.step(0.05); });
  await shot('06-elite');

  // upgrade panel
  await page.evaluate(() => { window.__g.test.setXP(500); window.__g.step(0.016); });
  await shot('07-upgrade');

  // character select
  await page.evaluate(() => { window.__g.test.returnToMenu(); window.__g.draw(); });
  await shot('08-menu2');

  if (errs.length) console.log('CONSOLE ERRORS:', errs.slice(0, 10));
  await browser.close();
})();
