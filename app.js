/* Accelerate Plumbing & Heating — site behaviour
   Vanilla JS, no dependencies. Progressive enhancement only. */
(function () {
  'use strict';
  var EMAIL = 'acceleratepandh@gmail.com';
  var TOWNS = ['prince george', 'mackenzie', 'vanderhoof', 'fort st. james', 'fort st james', 'quesnel'];

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  /* ---- headers: sticky pill on scroll, back-to-top ---- */
  function wireHeader() {
    var pill = $('#pill');
    var top = $('[data-top]');
    var isHome = document.body.classList.contains('home');
    function onScroll() {
      var y = window.scrollY;
      if (pill) {
        if (isHome) pill.classList.toggle('is-stuck', y > 160);
        else pill.classList.toggle('is-shown', y > 260);
      }
      if (top) top.classList.toggle('is-shown', y > 700);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---- mobile menu ---- */
  function wireMenu() {
    var m = $('#mnav');
    if (!m) return;
    function set(open) {
      m.classList.toggle('is-open', open);
      m.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    $$('[data-open]').forEach(function (b) { b.addEventListener('click', function () { set(true); }); });
    $$('[data-close]', m).forEach(function (b) { b.addEventListener('click', function () { set(false); }); });
    m.addEventListener('click', function (e) { if (e.target === m) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* ---- horizontal sliders ---- */
  function wireTracks() {
    $$('[data-track]').forEach(function (track) {
      var id = track.getAttribute('data-track');
      function step(dir) {
        var first = track.firstElementChild;
        var w = first ? first.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
        var max = track.scrollWidth - track.clientWidth - 2;
        if (dir > 0 && track.scrollLeft >= max) track.scrollTo({ left: 0, behavior: 'smooth' });
        else if (dir < 0 && track.scrollLeft <= 2) track.scrollTo({ left: max, behavior: 'smooth' });
        else track.scrollBy({ left: dir * w, behavior: 'smooth' });
      }
      $$('[data-next="' + id + '"]').forEach(function (b) { b.addEventListener('click', function () { step(1); }); });
      $$('[data-prev="' + id + '"]').forEach(function (b) { b.addEventListener('click', function () { step(-1); }); });
    });
  }

  /* ---- single-quote slider ---- */
  function wireQuotes() {
    $$('[data-qslider]').forEach(function (box) {
      var slides = $$('.qslide', box), i = 0;
      function go(n) {
        slides[i].classList.remove('is-active');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('is-active');
      }
      var next = $('[data-qnext]', box), prev = $('[data-qprev]', box);
      if (next) next.addEventListener('click', function () { go(i + 1); });
      if (prev) prev.addEventListener('click', function () { go(i - 1); });
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var timer = setInterval(function () { go(i + 1); }, 7000);
        box.addEventListener('mouseenter', function () { clearInterval(timer); });
      }
    });
  }

  /* ---- heading that fills in word by word as you scroll ---- */
  function wireReveal() {
    $$('.reveal-text').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
      var spans = $$('.w', el);
      function update() {
        var r = el.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.55)));
        var n = Math.round(p * spans.length);
        spans.forEach(function (s, k) { s.classList.toggle('on', k < n); });
      }
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* ---- stacked service cards: shrink slightly as the next one covers them ---- */
  function wireStack() {
    var cards = $$('.scard');
    if (!cards.length || !window.matchMedia('(min-width: 981px)').matches) return;
    function update() {
      cards.forEach(function (c, k) {
        var next = cards[k + 1];
        if (!next) { c.style.transform = ''; return; }
        var gap = next.getBoundingClientRect().top - c.getBoundingClientRect().top;
        var p = Math.min(1, Math.max(0, 1 - gap / c.offsetHeight));
        c.style.transform = 'scale(' + (1 - p * 0.05) + ')';
      });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---- "do we serve your area?" checker ---- */
  function wireAreaCheck() {
    $$('[data-area-check]').forEach(function (form) {
      var input = $('input', form), out = $('.check-msg', form.parentNode);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = input.value.trim().toLowerCase();
        if (!v) { out.textContent = 'Enter your town or postal code.'; return; }
        var hit = TOWNS.some(function (t) { return v.indexOf(t) > -1 || t.indexOf(v) > -1; }) || /^v2[klmn]/i.test(v.replace(/\s/g, ''));
        out.innerHTML = hit
          ? 'Good news &mdash; we serve your area. <a href="contact.html" style="color:#d12a22;font-weight:600">Request a quote &rarr;</a>'
          : 'Not sure &mdash; give us a call at <a href="tel:+12509615715" style="color:#d12a22;font-weight:600">250-961-5715</a>, chances are we cover it.';
      });
    });
  }


  /* =================== motion =================== */
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function wireProgress() {
    if (REDUCED) return;
    var bar = document.createElement('div');
    bar.className = 'progress';
    document.body.appendChild(bar);
    function u() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
    }
    window.addEventListener('scroll', u, { passive: true }); u();
  }

  /* elements to fade/slide in, grouped so siblings stagger */
  var REVEAL = [
    ['.sec-head > *, .faq__head > *, .offers__head > *, .process__top > div > *, .clear__head > *', ''],
    ['.svc-card, .offer, .promise, .step, .pcard, .gitem, .qa, .tcard, .slide, .team__tiles > div, .sgrid > div, .feat-row .feat, .cover__grid > *', ''],
    ['.about__body .head, .about__body .txt, .tsplit > div:last-child > *, .trust__body > *, .team__intro > *, .about-stats .txt, .quote-grid > div:first-child > *', ''],
    ['.panel__card, .ready, .qcard, .reach__card, .cform, .cside, .std-card, .chips span, .footer__grid > div, .footer__top > *', 'rv--zoom'],
    ['.adv__strip', ''],
    ['.band__strip', '']
  ];
  var REVEAL_IMG = '.about__main, .about__side, .tsplit .img, .clear__img, .cover__img, .about-hero .wide, .reach__card .img';

  function wireReveal2() {
    if (REDUCED || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');
        io.unobserve(el);
        // hand transform back to hover/tilt effects once the entrance is done
        setTimeout(function () { el.classList.remove('rv', 'in', 'rv-img', 'rv--zoom', 'rv--left', 'rv--right'); el.style.removeProperty('--d'); }, 1400 + (parseFloat(el.style.getPropertyValue('--d')) || 0) * 1000);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    function tag(el, extra) {
      if (el.classList.contains('rv') || el.closest('.hero')) return;
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches && c.classList.contains('rv'); });
      el.style.setProperty('--d', Math.min(sibs.length, 6) * 0.09 + 's');
      el.classList.add('rv');
      if (extra) el.classList.add(extra);
      io.observe(el);
    }
    REVEAL.forEach(function (g) { $$(g[0]).forEach(function (el) { tag(el, g[1]); }); });
    $$(REVEAL_IMG).forEach(function (el) { el.classList.add('rv-img'); io.observe(el); });
  }

  /* count-up numbers */
  function wireCount() {
    var els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        if (REDUCED) return;
        var target = parseFloat(el.getAttribute('data-count'));
        var dec = el.getAttribute('data-dec') === '1';
        var t0 = performance.now(), dur = 1600;
        (function step(now) {
          var p = Math.min(1, (now - t0) / dur), v = target * (1 - Math.pow(1 - p, 3));
          el.textContent = dec ? v.toFixed(1) : Math.round(v);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* parallax: hero photo, watermark lettering */
  function wireParallax() {
    if (REDUCED) return;
    var hero = $('.hero__bg');
    var wms = $$('.wm');
    var ticking = false;
    function u() {
      ticking = false;
      var vh = window.innerHeight;
      if (hero) hero.style.setProperty('--hy', Math.min(window.scrollY, vh) * 0.3 + 'px');
      wms.forEach(function (w) {
        var r = w.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        var t = $('.wm__text', w), i = $('img', w);
        if (t) t.style.setProperty('--py', p * 60 + 'px');
        if (i) i.style.setProperty('--iy', p * -40 + 'px');
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(u); } }, { passive: true });
    u();
  }

  /* subtle 3D tilt on cards (mouse only) */
  function wireTilt() {
    if (REDUCED || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.svc-card, .offer, .pcard, .promise, .std-box, .ready__card').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        if (el.classList.contains('rv')) return;
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .08s linear, box-shadow .45s';
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 7) + 'deg) rotateY(' + (x * 7) + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1), box-shadow .45s';
        el.style.transform = '';
      });
    });
  }

  /* magnetic pull on primary buttons */
  function wireMagnet() {
    if (REDUCED || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.hero .btn, .pill .btn, .ready .btn, .adv .btn').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.25 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ---- forms (validate, then open a pre-filled email) ---- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function setErr(input, bad) {
    var f = input.closest('.field');
    if (f) f.classList.toggle('has-err', !!bad);
    return !bad;
  }
  function mailto(name, body) {
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Quote request — ' + (name || 'New enquiry')) +
      '&body=' + encodeURIComponent(body);
  }
  function wireForm(formId, doneId, rules, build) {
    var form = document.getElementById(formId);
    if (!form) return;
    var done = document.getElementById(doneId);
    $$('input,textarea', form).forEach(function (i) { i.addEventListener('input', function () { setErr(i, false); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      rules.forEach(function (r) {
        var el = form.elements[r[0]];
        var v = el.value.trim();
        var bad = (r[1] && !v) || (r[2] && v && !EMAIL_RE.test(v));
        if (!setErr(el, bad)) ok = false;
      });
      if (!ok) { var f = $('.has-err input, .has-err textarea', form); if (f) f.focus(); return; }
      var data = build(form);
      var href = mailto(data.name, data.body);
      $$('[data-mailto]', done).forEach(function (a) { a.setAttribute('href', href); });
      $$('[data-out-name]', done).forEach(function (s) { s.textContent = data.name.split(' ')[0]; });
      form.style.display = 'none';
      done.style.display = 'block';
      window.location.href = href;
    });
    var again = $('[data-again]', done);
    if (again) again.addEventListener('click', function () {
      form.reset(); done.style.display = 'none'; form.style.display = '';
    });
  }

  ready(function () {
    wireHeader();
    wireMenu();
    wireTracks();
    wireQuotes();
    wireReveal();
    wireStack();
    wireAreaCheck();
    wireProgress();
    wireReveal2();
    wireCount();
    wireParallax();
    wireTilt();
    wireMagnet();

    wireForm('lead-form', 'lead-done', [['name', true], ['phone', true], ['email', false, true]], function (f) {
      var e = f.elements;
      return { name: e.name.value.trim(), body:
        'Name: ' + e.name.value + '\nPhone: ' + e.phone.value + '\nEmail: ' + e.email.value +
        '\nService: ' + e.service.value + '\n\n' + e.message.value };
    });

    wireForm('contact-form', 'contact-done',
      [['first', true], ['last', false], ['email', true, true], ['phone', true], ['address', true], ['message', true]],
      function (f) {
        var e = f.elements;
        var svcs = $$('input[name="services"]:checked', f).map(function (c) { return c.value; }).join(', ');
        var name = (e.first.value + ' ' + e.last.value).trim();
        return { name: name, body:
          'Name: ' + name + '\nPhone: ' + e.phone.value + '\nEmail: ' + e.email.value +
          '\nAddress: ' + [e.address.value, e.city.value, e.postal.value].map(function (x) { return x.trim(); }).filter(Boolean).join(', ') +
          '\nServices: ' + (svcs || '(not specified)') + '\n\nScope of work:\n' + e.message.value };
      });
  });
})();
