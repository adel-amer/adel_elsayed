// Page interactivity
document.addEventListener('DOMContentLoaded', () => {
    const WA_NUMBER = '966505635240';

    // Year
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // Navbar background on scroll
    const navbar = document.getElementById('navbar');
    const scrolledClasses = ['bg-darkslate-dark/95', 'shadow-xl', 'backdrop-blur-md'];
    const applyNav = () => scrolledClasses.forEach(c => navbar.classList.toggle(c, window.scrollY > 50));
    window.addEventListener('scroll', applyNav, { passive: true });
    applyNav();

    // Mobile menu (aria-aware, closes on link click / Escape)
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const setMenu = open => {
        menu.classList.toggle('hidden', !open);
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
        btn.querySelector('i').className = open ? 'fa-solid fa-xmark text-2xl' : 'fa-solid fa-bars text-2xl';
    };
    btn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    // Highlight the current page in the nav
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('header nav a, #mobile-menu a').forEach(a => {
        const file = a.getAttribute('href').split('#')[0];
        if (file === page && !(page === 'contact.html' && a.getAttribute('href').includes('#contact-info') && location.hash !== '#contact-info')) {
            a.classList.add('is-active');
        }
    });

    // Hero stats count up once
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('#hero .grid-cols-3 > div > span:first-child').forEach(el => {
        const m = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
        if (!m || reduce) return;
        const [, pre, num, post] = m, end = +num, t0 = performance.now() + 500, dur = 1400;
        el.textContent = pre + '0' + post;
        const tick = now => {
            const p = Math.min(Math.max((now - t0) / dur, 0), 1);
            el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + post;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });

    // Portfolio filter
    const filterBtns = document.querySelectorAll('#portfolio-filters button');
    const items = document.querySelectorAll('.portfolio-item');
    const on = ['bg-gold', 'text-darkslate', 'font-bold'];
    const off = ['bg-darkslate-light', 'text-gray-300', 'border', 'border-gray-700'];
    filterBtns.forEach(b => {
        b.setAttribute('aria-pressed', String(b.classList.contains('bg-gold')));
        b.addEventListener('click', () => {
            filterBtns.forEach(x => {
                x.classList.remove(...on); x.classList.add(...off);
                x.setAttribute('aria-pressed', 'false');
            });
            b.classList.add(...on); b.classList.remove(...off);
            b.setAttribute('aria-pressed', 'true');
            const f = b.dataset.filter;
            items.forEach(it => it.classList.add('is-fading'));
            setTimeout(() => {
                items.forEach(it => {
                    it.classList.toggle('is-hidden', !(f === 'all' || it.classList.contains(f)));
                    requestAnimationFrame(() => it.classList.remove('is-fading'));
                });
            }, reduce ? 0 : 250);
        });
    });

    // Project gallery: open a project, flip through its photos
    const projects = document.querySelectorAll('.portfolio-item[data-images]');
    if (projects.length) {
        const lb = document.createElement('div');
        lb.id = 'lightbox';
        lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'صور المشروع');
        lb.innerHTML = `
            <div class="lb-top"><span class="lb-count"></span>
                <button type="button" class="lb-btn lb-close" aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button></div>
            <div class="lb-stage">
                <button type="button" class="lb-btn lb-prev" aria-label="الصورة السابقة"><i class="fa-solid fa-chevron-right"></i></button>
                <figure><img class="lb-img" alt=""><figcaption></figcaption></figure>
                <button type="button" class="lb-btn lb-next" aria-label="الصورة التالية"><i class="fa-solid fa-chevron-left"></i></button>
            </div>
            <div class="lb-thumbs"></div>`;
        document.body.appendChild(lb);
        const img = lb.querySelector('.lb-img'), cap = lb.querySelector('figcaption'),
              count = lb.querySelector('.lb-count'), thumbs = lb.querySelector('.lb-thumbs');
        let imgs = [], idx = 0, opener = null, title = '';

        const show = i => {
            idx = (i + imgs.length) % imgs.length;
            img.src = imgs[idx]; img.alt = `${title} - صورة ${idx + 1}`;
            count.textContent = `${idx + 1} / ${imgs.length}`;
            thumbs.querySelectorAll('button').forEach((b, n) => b.setAttribute('aria-current', String(n === idx)));
            new Image().src = imgs[(idx + 1) % imgs.length];
        };
        const open = item => {
            opener = item;
            imgs = item.dataset.images.split('|');
            title = item.querySelector('h3').textContent;
            cap.innerHTML = '';
            const cat = document.createElement('small'); cat.textContent = item.querySelector('h3').previousElementSibling.textContent;
            const t = document.createElement('strong'); t.textContent = title;
            const d = document.createElement('p'); d.textContent = item.querySelector('p').textContent;
            cap.append(cat, t, d);
            thumbs.innerHTML = '';
            imgs.forEach((u, n) => {
                const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', `الصورة ${n + 1}`);
                b.innerHTML = '<img alt="">'; b.firstChild.src = u.replace('w=1600', 'w=300');
                b.addEventListener('click', () => show(n)); thumbs.appendChild(b);
            });
            const multi = imgs.length > 1;
            lb.querySelector('.lb-prev').hidden = lb.querySelector('.lb-next').hidden = thumbs.hidden = !multi;
            show(0);
            lb.classList.add('open'); document.body.classList.add('lb-lock');
            lb.querySelector('.lb-close').focus();
        };
        const close = () => {
            lb.classList.remove('open'); document.body.classList.remove('lb-lock');
            if (opener) opener.focus();
        };

        projects.forEach(p => {
            p.addEventListener('click', () => open(p));
            p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); } });
        });
        lb.querySelector('.lb-close').addEventListener('click', close);
        lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
        lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
        lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
        document.addEventListener('keydown', e => {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') show(idx + 1);   // RTL: left = next
            if (e.key === 'ArrowRight') show(idx - 1);
        });
        let x0 = null;
        lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
        lb.addEventListener('touchend', e => {
            if (x0 === null) return;
            const dx = e.changedTouches[0].clientX - x0; x0 = null;
            if (Math.abs(dx) > 50) show(dx < 0 ? idx + 1 : idx - 1);
        });
    }

    // Images with backups: if the main photo fails to load, try the next one
    document.querySelectorAll('img[data-fallbacks]').forEach(im => {
        const list = im.dataset.fallbacks.split('|');
        const next = () => { if (list.length) im.src = list.shift(); };
        im.addEventListener('error', next);
        if (im.complete && im.naturalWidth === 0 && im.currentSrc) next();
    });

    // Toast
    const toast = document.createElement('div');
    toast.id = 'toast'; toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    let toastTimer;
    const showToast = msg => {
        toast.textContent = msg; toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 5000);
    };

    // Forms: validate, then send the request to WhatsApp (no backend needed)
    const phoneOk = v => /^(\+?966|00966|0)?5\d{8}$/.test(v.replace(/[\s-]/g, ''));
    const setError = (input, msg) => {
        input.classList.add('field-error');
        input.setAttribute('aria-invalid', 'true');
        const e = document.createElement('p');
        e.className = 'field-error-msg'; e.textContent = msg;
        input.parentNode.appendChild(e);
    };
    const clearErrors = form => {
        form.querySelectorAll('.field-error-msg').forEach(e => e.remove());
        form.querySelectorAll('.field-error').forEach(i => {
            i.classList.remove('field-error'); i.removeAttribute('aria-invalid');
        });
    };
    const selText = s => s ? s.options[s.selectedIndex].text : '';

    const handle = (form, build, after) => {
        if (!form) return;
        form.addEventListener('submit', e => {
            e.preventDefault();
            clearErrors(form);
            const name = form.querySelector('input[type="text"]');
            const phone = form.querySelector('input[type="tel"]');
            let ok = true;
            if (name.value.trim().length < 2) { setError(name, 'اكتب اسمك الكامل'); ok = false; }
            if (!phoneOk(phone.value)) { setError(phone, 'اكتب رقم جوال سعودي صحيح، مثال: 0505635240'); ok = false; }
            if (!ok) { form.querySelector('.field-error').focus(); return; }
            const text = encodeURIComponent(build(form, name.value.trim(), phone.value.trim()));
            window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank', 'noopener');
            form.reset();
            after();
        });
    };

    handle(document.getElementById('quick-form'),
        (f, n, p) => `طلب كشف وتثمين\nالاسم: ${n}\nالجوال: ${p}\nالخدمة: ${selText(f.querySelector('select'))}`,
        () => showToast('تم تجهيز طلبك. أكمل الإرسال من واتساب وسنرد عليك قريباً.'));

    handle(document.getElementById('lead-form'),
        (f, n, p) => [
            'طلب استشارة وتسعير',
            `الاسم: ${n}`, `الجوال: ${p}`,
            `الخدمة: ${selText(f.querySelector('#property-type'))}`,
            `المساحة: ${f.querySelector('#space-area').value || '-'} م²`,
            `الميزانية: ${selText(f.querySelector('#budget'))}`,
            `التفاصيل: ${f.querySelector('#message').value.trim() || '-'}`
        ].join('\n'),
        () => {
            const ok = document.getElementById('success-message');
            ok.classList.remove('hidden');
            setTimeout(() => ok.classList.add('hidden'), 6000);
        });
});
