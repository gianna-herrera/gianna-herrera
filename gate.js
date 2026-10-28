(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* Geometría de fondo-dark.png (1586×992) */
  const HOLE = { r: 353.5 / 1586 };
  const ORIGIN = { x: 49.49, y: 46.42 };

  const root    = document.documentElement;
  const frame   = document.querySelector('.gx-frame');
  const bgInner = document.querySelector('.gx-bg-inner');

  gsap.set(frame,   { xPercent: -ORIGIN.x, yPercent: -ORIGIN.y, transformOrigin: ORIGIN.x + '% ' + ORIGIN.y + '%' });
  gsap.set(bgInner, { yPercent: -50, scale: 1.2 });

  function zoomTarget() {
    const holeRadiusPx = HOLE.r * frame.offsetWidth;
    const farthest = Math.hypot(innerWidth / 2, innerHeight / 2);
    return (farthest / holeRadiusPx) * 1.1;
  }

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    scrollTo(0, 0);
    root.classList.add('gx-lock');            // scroll bloqueado durante la intro

    const unlock = () => {
      if (!root.classList.contains('gx-lock')) return;
      root.classList.remove('gx-lock');
      ScrollTrigger.refresh();
    };
    setTimeout(unlock, 6000);                 // seguridad

    /* ---- Intro (unos 3 s) ---- */
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: unlock });
    intro
      .from('.gx-frame-layer', { scale: 1.18, duration: 2.2 }, 0)
      .from('.gx-bg', { opacity: 0, duration: 1.6 }, 0)
      .from('.gx-window-title > *', { opacity: 0, y: 14, duration: 1.2, stagger: .15 }, 0.6)
      .from('.gx-tl .gx-line > span, .gx-br .gx-line > span', { yPercent: 110, duration: 1.1, stagger: .12 }, 0.9)
      .from('.gx-bl > *, .gx-cue > *', { opacity: 0, y: 16, duration: .9, stagger: .06 }, 1.4)
      .from('.gx-cta', { opacity: 0, y: 20, duration: .9 }, 1.7)
      .from('nav', { y: -70, opacity: 0, duration: .9 }, 1.2);

    /* ---- Scroll: zoom hacia la ventana ---- */
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#gate',
        start: 'top top',
        end: '+=260%',
        scrub: 1,
        pin: '.gx-stage',
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tl
      .to(frame, { scale: zoomTarget, ease: 'power2.in', duration: 1 }, 0)
      .to(bgInner, { scale: 1.6, ease: 'power1.in', duration: 1 }, 0)
      .to('.gx-tl', { xPercent: -30, autoAlpha: 0, duration: .3 }, 0)
      .to('.gx-br', { xPercent: 30, autoAlpha: 0, duration: .3 }, 0)
      .to('.gx-bl', { yPercent: 20, autoAlpha: 0, duration: .25 }, 0)
      .to('.gx-cue', { autoAlpha: 0, duration: .15 }, 0)
      .to('.gx-cta', { autoAlpha: 0, yPercent: 40, duration: .2 }, 0)
      .to('.gx-window-title', { scale: 1.9, autoAlpha: 0, duration: .5, ease: 'power1.in' }, 0.1)
      .fromTo('.gx-outro', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .25, ease: 'power2.out' }, 0.78);
  });
})();