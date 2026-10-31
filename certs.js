/* ===== CERTIFICATIONS: Stacked Card Scroll + ventana glassmorphic ===== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1) Stacked card scroll ----------
     Cada tarjeta es sticky. Según cuánto han subido las tarjetas siguientes,
     la tarjeta de atrás se reduce, sube unos píxeles y se oscurece. */
  var stack = document.getElementById('stack');

  if (stack && window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);

    var cards  = Array.prototype.slice.call(stack.querySelectorAll('.scard'));
    var inners = cards.map(function (c) { return c.querySelector('.scard-in'); });
    var stuck  = [];
    var MAX_DEPTH = 3;          // a partir de la 3.ª capa ya no se ven más cambios

    var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

    function measure() {
      stuck = cards.map(function (c) { return parseFloat(getComputedStyle(c).top) || 0; });
    }

    function update() {
      var vh = window.innerHeight, start = vh * 0.92, p = [0], j, i, k, d;

      /* p[j] = cuánto ha subido la tarjeta j (0 = entrando, 1 = ya cubre a las anteriores) */
      for (j = 1; j < cards.length; j++) {
        var top = cards[j].getBoundingClientRect().top;
        p[j] = clamp((start - top) / Math.max(1, start - stuck[j]), 0, 1);
      }

      for (i = 0; i < cards.length - 1; i++) {
        d = 0;
        for (k = i + 1; k < cards.length; k++) d += p[k];
        d = Math.min(d, MAX_DEPTH);
        inners[i].style.transform = 'translate3d(0,' + (-d * 16).toFixed(2) + 'px,0) scale(' + (1 - d * 0.045).toFixed(4) + ')';
        inners[i].style.setProperty('--dim', (d * 0.13).toFixed(3));
      }
    }

    measure();
    ScrollTrigger.create({
      trigger: stack,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: update,
      onRefresh: function () { measure(); update(); }
    });
    window.addEventListener('resize', function () { measure(); update(); });
    update();
  }

  /* ---------- 2) Ventana flotante con la imagen de la certificación ---------- */
  var modal = document.getElementById('cmodal');
  if (!modal) return;

  var frame    = modal.querySelector('.cframe');
  var img      = document.getElementById('cmodal-img');
  var titleEl  = document.getElementById('cmodal-title');
  var orgEl    = document.getElementById('cmodal-org');
  var closeBtn = modal.querySelector('.cclose');
  var lastTrigger = null;

  function isOpen() { return modal.classList.contains('open'); }

  function openModal(btn) {
    lastTrigger = btn;
    var src = btn.getAttribute('data-cert');

    titleEl.textContent = btn.getAttribute('data-title');
    orgEl.textContent   = btn.getAttribute('data-org');
    frame.setAttribute('data-label', src);
    frame.classList.remove('empty');

    img.onload  = function () { frame.classList.remove('empty'); };
    img.onerror = function () { frame.classList.add('empty'); };
    img.alt = btn.getAttribute('data-title') + ' — certificate';
    img.src = src;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!isOpen()) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.explore');
    if (btn) openModal(btn);
  });

  /* Clic en el fondo oscuro o en la X cierra la ventana */
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal();
  });

  /* Mientras está abierta, la página de atrás no se desplaza
     (así el efecto de scroll continúa exactamente donde estaba al cerrar). */
  modal.addEventListener('wheel',     function (e) { e.preventDefault(); }, { passive: false });
  modal.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

  var SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown', 'Home', 'End', 'Tab'];
  window.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (SCROLL_KEYS.indexOf(e.key) > -1) {
      e.stopPropagation();                       // evita que el carrusel de Voices reaccione a las flechas
      if (!(e.key === ' ' && e.target === closeBtn)) e.preventDefault();
    }
  }, true);
})();