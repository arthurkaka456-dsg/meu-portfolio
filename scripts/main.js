/* ============================================================
   Studio AKD - Main JS (corrigido)
   Inclui:
   - Ano dinâmico
   - Smooth scroll para âncoras
   - Reveal on scroll (IntersectionObserver)
   - Cursor personalizado: bolinha branca QUE SUBSTITUI o ponteiro
     e aplica "negativo" apenas sobre imagens/cards
   ============================================================ */

/* --------------------------------------------
   Util: pronto (equivalente ao DOMContentLoaded)
   -------------------------------------------- */
(function onReady(fn){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
})(function initAKD(){

  /* =========================================
     1) Ano dinâmico no rodapé
     ========================================= */
  (function(){
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  })();

  /* =========================================
     2) Smooth scroll para âncoras internas
     ========================================= */
  (function(){
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function(a){
      a.addEventListener('click', function(e){
        var id = a.getAttribute('href');
        if (id && id.length > 1) {
          var target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  })();

  /* =========================================
     3) Reveal on scroll (sem libs)
     ========================================= */
  (function(){
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || els.length === 0){
      els.forEach(function(el){ el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: .12 });
    els.forEach(function(el){ io.observe(el); });
  })();

  /* =========================================
     4) Cursor personalizado — bolinha que SUBSTITUI o ponteiro
        e aplica negativo apenas sobre imagens/cards
     ========================================= */
  (function(){
    var supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!supportsFinePointer) return; // não ativa em touch

    var supportsBackdrop = !!(window.CSS && (
      CSS.supports('backdrop-filter', 'invert(1)') ||
      CSS.supports('-webkit-backdrop-filter', 'invert(1)')
    ));

    // ---- CSS injetado: oculta o cursor do sistema quando ativo ----
    var style = document.createElement('style');
    style.setAttribute('data-akd-cursor', 'true');
    style.textContent = `
      @media (pointer:fine){
        body.custom-cursor { cursor: none; }
        /* Mesmo em elementos que normalmente usam pointer */
        body.custom-cursor a,
        body.custom-cursor button,
        body.custom-cursor .btn,
        body.custom-cursor .card,
        body.custom-cursor [role="button"] { cursor: none; }
        /* Mantém I-beam em campos de texto/editáveis */
        body.custom-cursor input,
        body.custom-cursor textarea,
        body.custom-cursor [contenteditable="true"] { cursor: text; }
      }
    `;
    document.head.appendChild(style);

    // ---- Cria a bolinha do cursor (se não existir) ----
    document.body.classList.add('custom-cursor');
    var cur = document.querySelector('.akd-cursor');
    if (!cur) {
      cur = document.createElement('div');
      cur.className = 'akd-cursor is-hidden';
      document.body.appendChild(cur);
    }

    // Estilos inline da bolinha (independente do CSS externo)
    var BASE = 38;   // diâmetro normal (px)
    var HOVER = 48;  // diâmetro sobre itens clicáveis (px)
    Object.assign(cur.style, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: BASE + 'px',
      height: BASE + 'px',
      border: '2px solid #fff',
      borderRadius: '999px',
      background: 'transparent',
      pointerEvents: 'none',
      zIndex: '99999',
      transform: 'translate(-50%, -50%)',
      transition: 'width .2s ease, height .2s ease, border-color .2s ease, opacity .25s ease, background-color .2s ease',
      willChange: 'transform, backdrop-filter',
      opacity: '0',
      mixBlendMode: 'normal'
    });

    // ---- Helpers ----
    function hasBgImage(el){
      if (!el || el.nodeType !== 1) return false;
      var cs = getComputedStyle(el);
      var bg = cs.getPropertyValue('background-image');
      var varImg = cs.getPropertyValue('--img'); // sua var usada nos cards
      return (bg && bg !== 'none' && bg.includes('url(')) || (varImg && varImg.includes('url('));
    }
    function isOverImage(target){
      var el = target, steps = 0;
      while (el && steps < 6){
        if (el.matches && el.matches('img, picture, video')) return true;
        if (hasBgImage(el)) return true; // cobre .card/.card-media
        el = el.parentElement; steps++;
      }
      return false;
    }
    function isInteractive(target){
      return !!(target.closest && target.closest('a, button, .btn, [role="button"]'));
    }
    function isTextual(target){
      return !!(target.closest && target.closest('input, textarea, [contenteditable="true"]'));
    }

    // ---- Movimento INSTANTÂNEO (sem RAF/lerp) ----
    window.addEventListener('mousemove', function(e){
      // posição da bolinha = posição do ponteiro
      cur.style.left = e.clientX + 'px';
      cur.style.top  = e.clientY + 'px';
      cur.classList.remove('is-hidden');

      var t = e.target;

      // em campos de texto: esconda a bolinha para ver o I-beam nativo
      if (isTextual(t)){
        cur.style.opacity = '0';
        return;
      } else {
        cur.style.opacity = '0.95';
      }

      // tamanho ao passar em elementos clicáveis
      if (isInteractive(t)){
        cur.style.width = HOVER + 'px';
        cur.style.height = HOVER + 'px';
        cur.style.borderWidth = '2px';
      } else {
        cur.style.width = BASE + 'px';
        cur.style.height = BASE + 'px';
        cur.style.borderWidth = '2px';
      }

      // negativo apenas sobre imagens/cards
      if (isOverImage(t)){
        if (supportsBackdrop){
          cur.style.backdropFilter = 'invert(1) contrast(1.1)';
          cur.style.webkitBackdropFilter = 'invert(1) contrast(1.1)';
          cur.style.backgroundColor = 'rgba(255,255,255,.08)'; // leve glow
          cur.style.mixBlendMode = 'normal';
        } else {
          // Fallback universal (funciona até sem backdrop-filter)
          cur.style.backdropFilter = 'none';
          cur.style.webkitBackdropFilter = 'none';
          cur.style.backgroundColor = '#ffffff';
          cur.style.mixBlendMode = 'difference';
        }
      } else {
        cur.style.backdropFilter = 'none';
        cur.style.webkitBackdropFilter = 'none';
        cur.style.backgroundColor = 'transparent';
        cur.style.mixBlendMode = 'normal';
      }
    });

    // Esconde quando sai da viewport
    window.addEventListener('mouseleave', function(){
      cur.classList.add('is-hidden');
    });
  })();

}); // fim initAKD
