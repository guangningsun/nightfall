// 渲染英雄卡与永久技能表
(function () {
  const D = window.SITE;
  if (!D) return;

  // ---- 英雄卡 ----
  const grid = document.getElementById('heroGrid');
  if (grid) {
    const EN = { hunter:'ADRIAN', mage:'SERENA', rogue:'RAVEN', tank:'LOEN', medic:'ELIN',
                 marcus:'MARCUS', lira:'LIRA', kai:'KAI', elena:'ELENA', borin:'BORIN' };
    grid.innerHTML = D.heroes.map(h => {
      const art = h.img
        ? `<img src="${h.img}" alt="${h.name} ${h.role}" loading="lazy" width="380" height="380">`
        : `<div class="placeholder" aria-hidden="true">${h.placeholder || ''}</div>`;
      const mode = h.solo && h.coop ? '单人 / 双人'
                : h.coop ? '双人专属' : '单人';
      return `
      <article class="hero-card">
        <div class="hero-art">
          <span class="hero-role">${h.role}</span>
          <span class="hero-tag">${mode}</span>
          ${art}
        </div>
        <div class="hero-body">
          <h3 class="hero-name">${h.name}<span>${EN[h.key] || ''}</span></h3>
          <p class="hero-desc">${h.desc}</p>
          <dl class="hero-kit">
            <div><dt>主武</dt><dd>${h.main}</dd></div>
            <div><dt>副武</dt><dd>${h.sub}</dd></div>
            <div><dt>主动</dt><dd>${h.active}</dd></div>
            <div><dt>超武</dt><dd>${h.evol}</dd></div>
          </dl>
        </div>
      </article>`;
    }).join('');
  }

  // ---- 永久技能表 ----
  const table = document.getElementById('talentTable');
  if (table) {
    const fmt = n => Math.ceil(n).toLocaleString('en-US');
    table.innerHTML = `
      <div class="talent-row head">
        <span>技能 / 效果</span><span>等级</span><span>首次价格</span><span>升满所需</span>
      </div>` +
      D.talents.map(t => {
        const cells = Array.from({ length: t.max }, (_, i) =>
          `<i class="${i < 1 ? 'on' : ''}"></i>`).join('');
        // 源码 talents.js: cost = ceil(base * 100 * 1.5^当前等级)
        const first = t.base * 100;
        const total = Array.from({ length: t.max }, (_, i) =>
          t.base * 100 * Math.pow(1.5, i)).reduce((a, b) => a + b, 0);
        return `
        <div class="talent-row">
          <div>
            <div class="t-name">${t.name}</div>
            <div class="t-effect">${t.effect}</div>
          </div>
          <div class="t-lv">${cells}<span>0/${t.max}</span></div>
          <div class="t-price">${fmt(first)}</div>
          <div class="t-price">${fmt(total)}</div>
        </div>`;
      }).join('');
  }

  // ---- nav 高亮 ----
  const links = Array.from(document.querySelectorAll('.nav-links a'));
  const secs = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (secs.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a =>
          a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--gold)' : '');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => io.observe(s));
  }
})();
