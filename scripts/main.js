/* ============================================================
   Studio AKD - Main JS
   OBS: Este arquivo engloba:
   - Ano dinâmico
   - Smooth scroll para anchors
   - Reveal on scroll (IntersectionObserver)
   - Cursor personalizado (bolinha branca) com negativo sobre IMAGENS
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
     4) Cursor personalizado — bolinha branca
        + negativo SOMENTE ao passar sobre imagens
     ========================================= */
  (function(){
    // OBS: Só ativa em dispositivos com ponteiro "fino" (mouse/trackpad)
    var supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!supportsFinePointer) return;

    // OBS: Verifica suporte a backdrop-filter (melhor efeito)
    var supportsBackdrop = !!(window.CSS && (
      CSS.supports('backdrop-filter', 'invert(1)') ||
      CSS.supports('-webkit-backdrop-filter', 'invert(1)')
    ));

    // ---- Injeta CSS mínimo necessário via <style> ----
    var style = document.createElement('style');
    style.setAttribute('data-akd-cursor', 'true');
    style.textContent = `
      @media (pointer:fine){
        /* OBS: esconde o cursor padrão, mas mantém I-beam em campos de texto */
        body.custom-cursor { cursor: none; }
        body.custom-cursor input,
        body.custom-cursor textarea,
        body.custom-cursor [contenteditable="true"] { cursor: text; }
      }
    `;
    document.head.appendChild(style);

    // ---- Cria a bolinha do cursor ----
    var cur = document.createElement('div');
    cur.setAttribute('aria-hidden', 'true');
    // OBS: estilos inline para não depender do CSS externo
    var BASE = 38;           // diâmetro base (px)
    var HOVER = 48;          // diâmetro ao passar em link/botão
    Object.assign(cur.style, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: BASE + 'px',
      height: BASE + 'px',
      border: '2px solid #fff',
      borderRadius: '999px',
      background: 'transparent',      // muda dinamicamente
      pointerEvents: 'none',
      zIndex: '99999',
      transform: 'translate(-50%, -50%)',
      transition: 'width .2s ease, height .2s ease, border-color .2s ease, opacity .25s ease, background-color .2s ease',
      willChange: 'transform, backdrop-filter'
    });
    // Ajuste de blend por padrão
    cur.style.mixBlendMode = 'normal';
    cur.style.opacity = '0'; // começa escondido até o primeiro mousemove
    document.body.appendChild(cur);

    // ---- Ativa modo custom-cursor no body ----
    document.body.classList.add('custom-cursor');

    // ---- Lerp do cursor (seguindo o mouse suavemente) ----
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var x = window.innerWidth/2, y = window.innerHeight/2; // posição atual
    var tx = x, ty = y;                                    // alvo
    var speed = prefersReduced ? 1 : 0.18;                 // suavidade (1 = instantâneo)
    function raf(){
      x += (tx - x) * speed;
      y += (ty - y) * speed;
      cur.style.left = x + 'px';
      cur.style.top  = y + 'px';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ---- Helpers: detectar se está sobre "imagem" ----
    function hasBgImage(el){
      if (!el || el.nodeType !== 1) return false;
      var cs = window.getComputedStyle(el);
      var bg = cs.getPropertyValue('background-image');
      // também vale para variáveis do seu layout (--img)
      var varImg = cs.getPropertyValue('--img');
      return (bg && bg !== 'none' && bg.indexOf('url(') !== -1) || (varImg && varImg.indexOf('url(') !== -1);
    }
    function isOverImage(target){
      var el = target;
      var steps = 0;
      while (el && steps < 6){ // sobe poucos níveis na árvore
        if (el.matches && el.matches('img, picture, video')) return true;
        if (hasBgImage(el)) return true;                // cobre .card, .card-media etc.
        el = el.parentElement;
        steps++;
      }
      return false;
    }
    function isInteractive(target){
      return !!(target.closest && target.closest('a, button, .btn, [role="button"]'));
    }
    function isTextual(target){
      return !!(target.closest && target.closest('input, textarea, [contenteditable="true"]'));
    }

    // ---- Mouse events ----
    window.addEventListener('mousemove', function(e){
      tx = e.clientX; ty = e.clientY;
      // exibe a bolinha assim que o mouse se mover
      cur.style.opacity = '0.95';

      var t = e.target;

      // 1) Ajuste de tamanho se estiver sobre elemento interativo
      if (isInteractive(t)){
        cur.style.width = HOVER + 'px';
        cur.style.height = HOVER + 'px';
        cur.style.borderWidth = '2px';
      } else {
        cur.style.width = BASE + 'px';
        cur.style.height = BASE + 'px';
        cur.style.borderWidth = '2px';
      }

      // 2) Se estiver sobre campo de texto / editável, esconda a bolinha
      if (isTextual(t)){
        cur.style.opacity = '0';
        return; // não aplica efeitos
      }

      // 3) Efeito "negativo" apenas quando estiver sobre imagem
      var overImg = isOverImage(t);
      if (overImg){
        if (supportsBackdrop){
          // Melhor caso: invert só dentro da bolinha usando backdrop-filter
          cur.style.backdropFilter = 'invert(1) contrast(1.1)';
          cur.style.webkitBackdropFilter = 'invert(1) contrast(1.1)';
          cur.style.mixBlendMode = 'normal';
          cur.style.backgroundColor = 'rgba(255,255,255,.08)'; // leve glow
        } else {
          // Fallback universal: difference com fundo branco (também inverte)
          cur.style.backdropFilter = 'none';
          cur.style.webkitBackdropFilter = 'none';
          cur.style.mixBlendMode = 'difference';
          cur.style.backgroundColor = '#ffffff';
        }
      } else {
        // Fora de imagens: cursor limpo (sem negativo)
        cur.style.backdropFilter = 'none';
        cur.style.webkitBackdropFilter = 'none';
        cur.style.mixBlendMode = 'normal';
        cur.style.backgroundColor = 'transparent';
      }
    });

    // Esconde quando sai da viewport
    window.addEventListener('mouseleave', function(){
      cur.style.opacity = '0';
    });

  })(); // fim cursor personalizado

}); // fim initAKD
