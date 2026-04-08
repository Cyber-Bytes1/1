/* ==========================================================================
   L'Italie sur roues — Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ---- Mobile nav toggle ----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }

    // ---- Hero floating particles ----
    if (!prefersReduced) {
        document.querySelectorAll('.hero, .about-hero').forEach(hero => {
            const container = document.createElement('div');
            container.classList.add('hero-particles');
            for (let i = 0; i < 20; i++) {
                const p = document.createElement('div');
                p.classList.add('hero-particle');
                const size = Math.random() * 6 + 2;
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.left = Math.random() * 100 + '%';
                p.style.top = Math.random() * 100 + '%';
                p.style.setProperty('--duration', (Math.random() * 10 + 8) + 's');
                p.style.setProperty('--delay', (Math.random() * 5) + 's');
                p.style.setProperty('--tx', (Math.random() * 200 - 100) + 'px');
                p.style.setProperty('--ty', (Math.random() * -200 - 50) + 'px');
                container.appendChild(p);
            }
            hero.appendChild(container);
        });
    }

    // ---- Hero parallax (subtle) ----
    if (!prefersReduced) {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            window.addEventListener('scroll', () => {
                const y = window.scrollY;
                if (y < window.innerHeight) {
                    heroContent.style.transform = `translateY(${y * 0.25}px)`;
                    heroContent.style.opacity = 1 - y / (window.innerHeight * 0.9);
                }
            }, { passive: true });
        }
    }

    // ---- Scroll reveal with stagger ----
    if ('IntersectionObserver' in window) {
        // Standard fade-in elements
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        // Category headers (line + title animation)
        document.querySelectorAll('.category-header').forEach(el => {
            fadeObserver.observe(el);
        });

        // About sections with alternate left/right
        document.querySelectorAll('.about-story').forEach(el => {
            el.classList.add('fade-in');
            fadeObserver.observe(el);
        });

        document.querySelectorAll('.about-team').forEach(el => {
            el.classList.add('fade-in');
            fadeObserver.observe(el);
        });

        document.querySelectorAll('.about-philosophy h2').forEach(el => {
            el.classList.add('fade-in');
            fadeObserver.observe(el);
        });

        // Menu items with stagger
        document.querySelectorAll('.menu-category').forEach(category => {
            const items = category.querySelectorAll('.menu-item');
            items.forEach((item, i) => {
                item.classList.add('fade-in', `stagger-${(i % 4) + 1}`);
                fadeObserver.observe(item);
            });
        });

        // Philosophy cards with stagger
        document.querySelectorAll('.philosophy-card').forEach((card, i) => {
            card.classList.add('scale-in', `stagger-${(i % 3) + 1}`);
            fadeObserver.observe(card);
        });

        // Category subtitles
        document.querySelectorAll('.category-subtitle').forEach(el => {
            el.classList.add('fade-in');
            fadeObserver.observe(el);
        });

        // Team photo
        document.querySelectorAll('.team-photo-container').forEach(el => {
            el.classList.add('scale-in');
            fadeObserver.observe(el);
        });
    }

    // ---- Menu item tilt on hover ----
    if (!prefersReduced) {
        document.querySelectorAll('.menu-item').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;
                card.style.transform = `translateY(-6px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ---- Smooth counter for prices on hover ----
    document.querySelectorAll('.item-price').forEach(price => {
        const text = price.textContent.trim();
        const num = parseInt(text);
        if (isNaN(num)) return;

        let animated = false;
        const parent = price.closest('.menu-item');
        if (!parent) return;

        parent.addEventListener('mouseenter', () => {
            if (animated) return;
            animated = true;
            let current = 0;
            const step = Math.ceil(num / 15);
            const interval = setInterval(() => {
                current += step;
                if (current >= num) {
                    current = num;
                    clearInterval(interval);
                    setTimeout(() => { animated = false; }, 500);
                }
                price.textContent = current + ' €';
            }, 30);
        });
    });
});
});
