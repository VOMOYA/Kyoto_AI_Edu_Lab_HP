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
    }
});
