// 公共工具：解析 playwright 模块 + 仓库内路径。
// 之前的脚本写死了本机绝对路径，别人 clone 下来必然报错，
// 这里统一改成「仓库根目录 + 环境变量可覆盖」。

const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    'playwright',
    path.join(ROOT, 'node_modules', 'playwright')
  ].filter(Boolean);
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

// 官网截图输出目录（不入库，gitignore 覆盖）
// 需要进官网的截图请手动挑过后拷贝到 site/assets/shots/
const SITE_SHOTS = path.join(ROOT, 'site', '.shots');

// harness 静态服务地址：需在仓库根目录起一个静态服务
const HARNESS_URL =
  process.env.HARNESS_URL || 'http://127.0.0.1:8899/tools/harness/index.html';

module.exports = { ROOT, loadPlaywright, SITE_SHOTS, HARNESS_URL };
