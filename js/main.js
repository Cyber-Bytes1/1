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

    // ==================================================================
    //  CART SYSTEM
    // ==================================================================
    const cartFab = document.getElementById('cartFab');
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartBadge = document.getElementById('cartBadge');
    const cartItemsEl = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCheckout = document.getElementById('cartCheckout');
    const cartClear = document.getElementById('cartClear');
    const cartToast = document.getElementById('cartToast');

    if (!cartFab) return; // Only on pages with cart

    let cart = JSON.parse(localStorage.getItem('isr_cart') || '[]');

    function saveCart() {
        localStorage.setItem('isr_cart', JSON.stringify(cart));
    }

    function showToast(msg) {
        cartToast.textContent = msg;
        cartToast.classList.add('show');
        setTimeout(() => cartToast.classList.remove('show'), 1800);
    }

    function updateBadge() {
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        cartBadge.textContent = count;
        cartBadge.setAttribute('data-count', count);
        cartBadge.classList.add('bounce');
        setTimeout(() => cartBadge.classList.remove('bounce'), 300);
    }

    function getTotal() {
        return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="cart-empty">Votre panier est vide</p>';
            cartFooter.style.display = 'none';
        } else {
            cartFooter.style.display = '';
            cartItemsEl.innerHTML = cart.map((item, i) => `
                <div class="cart-item" data-index="${i}">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price} € × ${item.qty} = ${item.price * item.qty} €</div>
                    </div>
                    <div class="cart-item-qty">
                        <button class="cart-qty-minus" data-index="${i}" aria-label="Diminuer">−</button>
                        <span>${item.qty}</span>
                        <button class="cart-qty-plus" data-index="${i}" aria-label="Augmenter">+</button>
                    </div>
                    <button class="cart-item-remove" data-index="${i}" aria-label="Supprimer">✕</button>
                </div>
            `).join('');
            cartTotalEl.textContent = getTotal() + ' €';
        }
        updateBadge();
        saveCart();
    }

    function addToCart(name, price) {
        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ name, price, qty: 1 });
        }
        renderCart();
        showToast(`${name} ajouté !`);
    }

    function openCart() {
        cartPanel.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartPanel.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Open / close cart
    cartFab.addEventListener('click', openCart);
    cartOverlay.addEventListener('click', closeCart);
    cartClose.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCart();
    });

    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const menuItem = btn.closest('.menu-item');
            const name = menuItem.dataset.name;
            const price = parseInt(menuItem.dataset.price);
            addToCart(name, price);

            // Button feedback
            btn.textContent = '✓ Ajouté';
            btn.classList.add('added');
            setTimeout(() => {
                btn.textContent = '+ Ajouter';
                btn.classList.remove('added');
            }, 1200);
        });
    });

    // Cart quantity and remove buttons (event delegation)
    cartItemsEl.addEventListener('click', (e) => {
        const target = e.target;
        const index = parseInt(target.dataset.index);
        if (isNaN(index)) return;

        if (target.classList.contains('cart-qty-plus')) {
            cart[index].qty++;
            renderCart();
        } else if (target.classList.contains('cart-qty-minus')) {
            cart[index].qty--;
            if (cart[index].qty <= 0) cart.splice(index, 1);
            renderCart();
        } else if (target.classList.contains('cart-item-remove')) {
            cart.splice(index, 1);
            renderCart();
        }
    });

    // Clear cart
    cartClear.addEventListener('click', () => {
        cart = [];
        renderCart();
        showToast('Panier vidé');
    });

    // Checkout — Stripe Checkout Session
    cartCheckout.addEventListener('click', async () => {
        if (cart.length === 0) return;

        // Show loading state
        const origText = cartCheckout.textContent;
        cartCheckout.textContent = 'Redirection…';
        cartCheckout.disabled = true;

        try {
            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Checkout failed');
            }

            // Redirect to Stripe hosted checkout
            window.location.href = data.url;
        } catch (err) {
            alert('Erreur lors du paiement : ' + err.message);
            cartCheckout.textContent = origText;
            cartCheckout.disabled = false;
        }
    });

    // Initial render
    renderCart();

    // Handle Stripe checkout result
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
        cart = [];
        saveCart();
        renderCart();
        showToast('Paiement réussi — Merci ! 🇮🇹');
        window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('checkout') === 'cancel') {
        showToast('Paiement annulé');
        window.history.replaceState({}, '', window.location.pathname);
    }
});
