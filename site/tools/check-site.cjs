// 官网本地 QA：静态起服务 + Playwright 双端截图 + 溢出/报错/破图检查。
//
// 用法：
//   npm i playwright && npx playwright install chromium
//   node site/tools/check-site.cjs
//
// 可选环境变量：
//   PLAYWRIGHT_PATH  指定 playwright 模块目录（默认先找本地 node_modules）
//   SITE_OUT         截图输出目录（默认 site/.shots）
//   SITE_PORT        本地静态服务端口（默认 8900；被占用时自动退到随机空闲端口）

const fs = require('fs');
const http = require('http');
const path = require('path');

const SITE_DIR = path.resolve(__dirname, '..');
const OUT = process.env.SITE_OUT || path.join(SITE_DIR, '.shots');
const PORT = Number(process.env.SITE_PORT || 8900);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.svg': 'image/svg+xml'
};

function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_PATH, 'playwright'].filter(Boolean);
  for (const c of candidates) {
    try {
      return require(c);
    } catch (e) {
      /* try next */
    }
  }
  throw new Error(
    'playwright 未找到。请先 npm i playwright && npx playwright install chromium，' +
      '或用 PLAYWRIGHT_PATH 指定模块目录。'
  );
}

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(SITE_DIR, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(SITE_DIR)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404).end('not found');
      return;
    }
    const body = fs.readFileSync(file);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream'
    });
    res.end(body);
  });
  return new Promise((resolve, reject) => {
    server.once('error', err => {
      if (err.code === 'EADDRINUSE' && PORT !== 0) {
        // 端口被占用：退到随机空闲端口，不因为环境里残留进程而失败
        server.listen(0, '127.0.0.1', () => resolve(server));
      } else {
        reject(err);
      }
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  const PW = loadPlaywright();
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  console.log(`本地服务: ${base}`);
  const browser = await PW.chromium.launch();
  const problems = [];

  for (const [name, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const page = await browser.newPage({
      viewport: { width: w, height: h },
      deviceScaleFactor: 2
    });
    page.on('pageerror', e => problems.push(`${name}: JS 错误 ${e.message}`));
    page.on('console', m => {
      if (m.type() === 'error') problems.push(`${name}: console ${m.text()}`);
    });
    page.on('response', r => {
      if (r.status() >= 400) problems.push(`${name}: ${r.status()} ${r.url()}`);
    });

    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, `${name}-full.png`), fullPage: true });
    await page.screenshot({ path: path.join(OUT, `${name}-top.png`) });

    // 滚动全页触发 loading="lazy" 图片加载，再判定是否破图
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page
      .waitForFunction(
        () => Array.from(document.images).every(i => i.complete),
        { timeout: 15000 }
      )
      .catch(() => {});
    await page.waitForTimeout(300);

    const ov = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth
    }));
    const overflow = ov.scrollW - ov.clientW;
    console.log(
      `${name}: 横向溢出 ${overflow}px`,
      overflow > 0 ? 'HORIZONTAL SCROLL!' : 'ok'
    );
    if (overflow > 0) problems.push(`${name}: 横向溢出 ${overflow}px`);

    const broken = await page.evaluate(() =>
      Array.from(document.images)
        .filter(i => i.complete && i.naturalWidth === 0)
        .map(i => i.getAttribute('src'))
    );
    if (broken.length) problems.push(`${name}: 破图 ${broken.join(', ')}`);
    else console.log(`${name}: 无破图`);

    await page.close();
  }

  await browser.close();
  server.close();

  if (problems.length) {
    console.log('\n发现问题:');
    problems.slice(0, 20).forEach(p => console.log(' -', p));
    process.exitCode = 1;
  } else {
    console.log('\n无 JS 错误、无失败请求、无破图、无横向溢出。');
  }
  console.log(`截图输出: ${OUT}`);
})();
