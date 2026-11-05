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

// 实机画面广告屏轮播
(function () {
  const root = document.getElementById('bb');
  if (!root) return;
  const stage = root.querySelector('.bb-stage');
  const slides = Array.from(root.querySelectorAll('.bb-slide'));
  const dotsBox = root.querySelector('.bb-dots');
  const plList = root.querySelector('.bb-pl-list');
  const nowEl = root.querySelector('.bb-count b');
  if (!slides.length || !dotsBox || !plList) return;

  const DURATION = 4600;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');
  const titleOf = s => (s.querySelector('figcaption') || {}).textContent || '';

  // 圆点 + 节目单都由 slides 生成，避免两处维护
  slides.forEach((s, i) => {
    const label = titleOf(s);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'bb-dot' + (i === 0 ? ' is-on' : '');
    dot.setAttribute('aria-label', `第 ${i + 1} 张：${label}`);
    dot.addEventListener('click', () => go(i));
    dotsBox.appendChild(dot);

    const li = document.createElement('li');
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'bb-pl-item' + (i === 0 ? ' is-on' : '');
    item.innerHTML =
      `<span class="bb-pl-no">${pad(i + 1)}</span>` +
      `<span class="bb-pl-txt"></span><i class="bb-pl-bar"></i>`;
    item.querySelector('.bb-pl-txt').textContent = label;
    item.addEventListener('click', () => go(i));
    li.appendChild(item);
    plList.appendChild(li);
  });

  const dots = Array.from(dotsBox.children);
  const items = Array.from(plList.querySelectorAll('.bb-pl-item'));

  let cur = 0, timer = null, inView = false, hovering = false;

  function go(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === cur));
    dots.forEach((d, k) => d.classList.toggle('is-on', k === cur));
    items.forEach((it, k) => {
      it.classList.toggle('is-on', k === cur);
      // 重置进度条动画
      const bar = it.querySelector('.bb-pl-bar');
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    if (nowEl) nowEl.textContent = pad(cur + 1);
    sync();
  }

  function sync() {
    if (timer) { clearInterval(timer); timer = null; }
    if (inView && !hovering && !reduced) {
      timer = setInterval(() => go(cur + 1), DURATION);
    }
  }

  root.querySelectorAll('.bb-arrow').forEach(b =>
    b.addEventListener('click', () => go(cur + Number(b.dataset.dir))));

  root.addEventListener('mouseenter', () => { hovering = true; sync(); });
  root.addEventListener('mouseleave', () => { hovering = false; sync(); });
  root.addEventListener('focusin', () => { hovering = true; sync(); });
  root.addEventListener('focusout', () => { hovering = false; sync(); });

  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); }
  });

  // 只有滚到可视区才轮播
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => {
      inView = e.isIntersecting;
      sync();
    }), { threshold: 0.25 }).observe(root);
  } else {
    inView = true;
    sync();
  }

  // 手势滑动
  let x0 = null;
  stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();
