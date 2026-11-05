// Capture the remaining screens: codex, talent shop, siege, character select.
//
// 前置：在仓库根目录起静态服务
//   python3 -m http.server 8899
// 然后
//   node tools/harness/capture2.js
const path = require('path');
const { loadPlaywright, SITE_SHOTS, HARNESS_URL } = require('./pw');

const PW = loadPlaywright();

const OUT = process.env.SHOT_OUT || SITE_SHOTS;
const URL = HARNESS_URL;

(async () => {
  const browser = await PW.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 520, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction('window.__ready === true', { timeout: 15000 });

  const shot = async (name) => {
    await page.evaluate(() => window.__g.draw());
    await page.waitForTimeout(100);
    const el = await page.$('#gamecanvas');
    await el.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('shot', name);
  };

  // ---- character select (square cards) ----
  await page.evaluate(() => {
    const g = window.__g;
    g.test.returnToMenu(); g.draw();
    const s = g.getState();
    const cards = s.hitboxes.filter(b => b.w === b.h);
    if (cards[0]) cards[0].fn();
  });
  await shot('09-character-select');

  // ---- codex (超武图鉴) ----
  await page.evaluate(() => {
    const g = window.__g;
    g.test.returnToMenu(); g.draw();
    const s = g.getState();
    // codex entry is a small square button; find the smallest square hitbox
    const squares = s.hitboxes.filter(b => b.w === b.h && b.w < 80);
    const entry = squares.sort((a, b) => a.w - b.w)[0];
    if (entry) entry.fn();
  });
  await shot('10-codex');

  // ---- permanent skills (永久技能) ----
  await page.evaluate(() => {
    const g = window.__g;
    g.test.returnToMenu(); g.draw();
    const s = g.getState();
    // talent shop button sits next to codex in the same row
    const squares = s.hitboxes.filter(b => b.w === b.h && b.w < 80).sort((a, b) => a.w - b.w);
    if (squares[1]) squares[1].fn();
  });
  await shot('11-talents');

  // ---- battle with many enemies (crowd density) ----
  await page.evaluate(() => {
    const g = window.__g;
    g.test.returnToMenu();
    g.test.setHero('hunter'); g.start();
    g.test.setTime(420);
    for (let i = 0; i < 120; i++) g.step(0.05);
  });
  await shot('12-crowd-dense');

  // ---- character cards for extra heroes ----
  for (const hero of ['marcus', 'lira', 'kai', 'elena', 'borin']) {
    await page.evaluate((h) => {
      const g = window.__g;
      g.test.returnToMenu();
      g.test.setHero(h); g.start();
      for (let i = 0; i < 60; i++) g.step(0.05);
    }, hero);
    await shot('13-hero-' + hero);
  }

  // ---- dawn victory ----
  await page.evaluate(() => {
    const g = window.__g;
    g.test.returnToMenu();
    g.test.setHero('mage'); g.start();
    g.test.setTime(598);
    for (let i = 0; i < 20; i++) g.step(0.05);
  });
  await shot('14-dawn');

  if (errs.length) console.log('ERRORS:', errs.slice(0, 6));
  await browser.close();
})();
