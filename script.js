document.addEventListener('DOMContentLoaded', function () {
    // ---------- Mobile nav (hamburger) ----------
    const bar = document.querySelector('nav.bar');
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (bar && toggle && menu) {
        const setOpen = (open) => {
            bar.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        toggle.addEventListener('click', () => setOpen(!bar.classList.contains('open')));
        // タップで各リンクへ移動したらメニューを閉じる
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
        // Escで閉じる
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
        // デスクトップ幅に戻ったら状態リセット
        window.addEventListener('resize', () => { if (window.innerWidth > 760) setOpen(false); }, { passive: true });
    }

    // ---------- Smooth scrolling ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        });
    });

    // ---------- Reveal on scroll ----------
    const revealTargets = document.querySelectorAll('.rv, .reveal, .reveal-stagger');
    if ('IntersectionObserver' in window && revealTargets.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(el => io.observe(el));
    } else {
        revealTargets.forEach(el => { el.classList.add('in'); el.classList.add('visible'); });
    }

    // ---------- News（開催日を過ぎたカードは自動で隠す・カウントダウン・早割表示） ----------
    // 日付は日本時間で判定する（海外からの閲覧でもずれないように）
    const todayJST = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    const dayDiff = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
    const news = document.getElementById('news');
    if (news) {
        const today = todayJST();
        const cards = [...news.querySelectorAll('.ev[data-date]')];
        cards.forEach(card => {
            const left = dayDiff(card.dataset.date, today);
            if (left < 0) { card.hidden = true; return; }
            const cnt = card.querySelector('.ev-count');
            if (cnt) cnt.textContent = left === 0 ? '本日開催' : left === 1 ? '明日開催' : `あと${left}日`;
            card.querySelectorAll('[data-until]').forEach(el => { if (today > el.dataset.until) el.remove(); });
        });
        const live = cards.filter(c => !c.hidden);
        // 開催日の近い順に並べ替え
        live.sort((a, b) => a.dataset.date.localeCompare(b.dataset.date)).forEach(c => c.parentNode.appendChild(c));
        const grid = news.querySelector('.news-grid');
        if (grid) grid.classList.toggle('one', live.length === 1);
        if (!live.length) {
            news.hidden = true;
            document.querySelectorAll('a[href="#news"]').forEach(a => { const li = a.closest('li'); (li || a).remove(); });
        }
    }

    // ---------- Records（カテゴリ絞り込み＋最初は新しい順に数件だけ表示） ----------
    const log = document.getElementById('act-log');
    if (log) {
        const LIMIT = 6;
        const rows = [...log.querySelectorAll('.act-row')];
        const chips = [...document.querySelectorAll('.log-tools .chip')];
        const more = document.querySelector('.log-more');
        const moreBtn = more && more.querySelector('.log-more-btn');
        let filter = 'all', expanded = false;
        chips.forEach(ch => {
            const f = ch.dataset.f;
            const n = f === 'all' ? rows.length : rows.filter(r => r.dataset.cat === f).length;
            const span = ch.querySelector('.n'); if (span) span.textContent = n;
            if (!n) ch.hidden = true;
        });
        const render = () => {
            const hit = rows.filter(r => filter === 'all' || r.dataset.cat === filter);
            const cut = !expanded && hit.length > LIMIT;
            rows.forEach(r => { r.hidden = true; });
            hit.forEach((r, i) => {
                r.hidden = cut && i >= LIMIT;
                if (!r.hidden) r.classList.add('in');
            });
            if (more) {
                more.hidden = hit.length <= LIMIT;
                more.classList.toggle('fade', cut);
                moreBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                moreBtn.querySelector('.t').textContent = expanded ? '閉じる' : 'すべての記録を見る';
                moreBtn.querySelector('.c').textContent = expanded ? '' : `残り${hit.length - LIMIT}件`;
            }
        };
        chips.forEach(ch => ch.addEventListener('click', () => {
            filter = ch.dataset.f; expanded = false;
            chips.forEach(c => { const on = c === ch; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
            render();
        }));
        if (moreBtn) moreBtn.addEventListener('click', () => {
            const wasOpen = expanded;
            expanded = !expanded; render();
            // 閉じたときは記録の先頭へ戻す（ページの途中に取り残さない）
            if (wasOpen) {
                const head = document.querySelector('.act-sub');
                if (head) window.scrollTo({ top: head.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
            }
        });
        render();
    }

    // ---------- Floating CTA visibility ----------
    const floating = document.querySelector('.floating-cta');
    if (floating) {
        const heroEl = document.querySelector('.hero-home, .hero');
        const heroHeight = (heroEl && heroEl.offsetHeight) || 600;
        const toggleFloating = () => {
            floating.style.opacity = (window.scrollY > heroHeight * 0.6) ? '1' : '0';
        };
        floating.style.transition = 'opacity 0.3s ease';
        floating.style.opacity = '0';
        toggleFloating();
        window.addEventListener('scroll', toggleFloating, { passive: true });
        const contactEl = document.querySelector('#contact, section.cta');
        if (contactEl && 'IntersectionObserver' in window) {
            new IntersectionObserver((es) => {
                floating.classList.toggle('off', es[0].isIntersecting);
            }, { rootMargin: '0px 0px -10% 0px' }).observe(contactEl);
        }
    }

    // ---------- Reel（画面内で自動再生・音声トグル） ----------
    const reelFrame = document.querySelector('.reel-frame');
    const reel = reelFrame && reelFrame.querySelector('.reel-video');
    if (reel) {
        const soundBtn = document.querySelector('.reel-sound');
        const playBtn = reelFrame.querySelector('.reel-play');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let userPaused = reduce;
        const sync = () => reelFrame.classList.toggle('paused', reel.paused);
        const tryPlay = () => { const p = reel.play(); if (p && p.catch) p.catch(() => sync()); };
        reel.addEventListener('play', sync);
        reel.addEventListener('pause', sync);
        sync();
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting && !userPaused) tryPlay();
                    else if (!e.isIntersecting) reel.pause();
                });
            }, { threshold: 0.45 }).observe(reelFrame);
        } else if (!reduce) { tryPlay(); }
        const toggle = () => { if (reel.paused) { userPaused = false; tryPlay(); } else { userPaused = true; reel.pause(); } };
        reel.addEventListener('click', toggle);
        playBtn.addEventListener('click', toggle);
        soundBtn.addEventListener('click', () => {
            const on = reel.muted;
            reel.muted = !on;
            if (on) { reel.currentTime = 0; userPaused = false; tryPlay(); }
            soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
            soundBtn.querySelector('i').className = on ? 'mdi mdi-volume-high' : 'mdi mdi-volume-off';
            soundBtn.querySelector('span').textContent = on ? '音声をOFFにする' : '音声をONにする';
        });
    }
});
