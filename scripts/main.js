/* ============================================================
   Studio AKD - Main JS (v cursor VER)
   Inclui:
   - Ano dinâmico
   - Smooth scroll para âncoras
   - Reveal on scroll (IntersectionObserver)
   - Cursor personalizado: bolinha pequena que SUBSTITUI o ponteiro;
     ao passar em elementos clicáveis, cresce e mostra "VER" dentro.
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
     4) Cursor personalizado — bolinha menor que SUBSTITUI o ponteiro
        Em elementos clicáveis: cresce e exibe "VER"
     ========================================= */
  (function(){
    var supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!supportsFinePointer) return; // não ativa em touch

    // ---- CSS injetado: oculta o cursor do sistema e estiliza a bolinha/label ----
    var style = document.createElement('style');
    style.setAttribute('data-akd-cursor', 'true');
    style.textContent = `
      @media (pointer:fine){
        /* OBS: esconde o cursor do sistema no site todo */
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

        /* Cursor base (o círculo) */
        .akd-cursor{
          position: fixed;
          left: 0; top: 0;
          display: grid;
          place-items: center;
          border: 2px solid #fff;
          border-radius: 999px;
          background: transparent;
          color: #000;               /* cor do texto quando preencher de branco */
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          transition:
            width .18s ease, height .18s ease,
            background-color .18s ease, border-color .18s ease,
            opacity .18s ease, transform .04s linear;
          will-change: transform;
          opacity: 0;                /* aparece no primeiro mousemove */
        }

        /* Rótulo "VER" (fica oculto no estado base) */
        .akd-cursor .label{
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-weight: 400;
          letter-spacing: .06em;
          user-select: none;
          opacity: 0;
          transform: scale(.9);
          transition: opacity .12s ease, transform .12s ease;
          pointer-events: none;
          color: #000;              /* texto preto dentro do círculo branco */
        }

        /* Estado interativo: cresce e mostra "VER" */
        .akd-cursor.is-interactive{
          background: #fff;          /* preenche para dar contraste ao texto */
          border-color: #fff;
        }
        .akd-cursor.is-interactive .label{
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);

    // ---- Cria a bolinha do cursor ----
    document.body.classList.add('custom-cursor');

    var cur = document.createElement('div');
    cur.className = 'akd-cursor is-hidden';

    var label = document.createElement('span');
    label.className = 'label';
    label.textContent = 'VER'; // OBS: texto exibido no hover interativo

    cur.appendChild(label);
    document.body.appendChild(cur);

    // Tamanhos (px)
    var BASE = 18;   // bolinha menor (padrão)
    var HOVER = 56;  // tamanho ao passar sobre algo clicável (para caber "VER")

    // aplica tamanho base (inline para não depender do CSS)
    setSize(cur, BASE);

    // Helpers de detecção
    function isInteractive(target){
      // anchors, botões, roles de botão e elementos com handler direto
      if (!target) return false;
      return !!(target.closest &&
        target.closest('a, button, .btn, .card-link, [role="button"], [data-interactive="true"]'));
    }
    function isTextual(target){
      return !!(target && target.closest &&
        target.closest('input, textarea, [contenteditable="true"]'));
    }

    // Movimento instantâneo (substitui o ponteiro)
    window.addEventListener('mousemove', function(e){
      cur.style.left = e.clientX + 'px';
      cur.style.top  = e.clientY + 'px';
      cur.style.opacity = '0.95';

      var t = e.target;

      // Em campos de texto: some para ver I-beam nativo
      if (isTextual(t)){
        cur.style.opacity = '0';
        cur.classList.remove('is-interactive');
        setSize(cur, BASE);
        return;
      }

      // Interativo? Cresce e mostra "VER"
      if (isInteractive(t)){
        cur.classList.add('is-interactive');
        setSize(cur, HOVER);
        // Ajusta fonte conforme tamanho
        label.style.fontSize = '12px'; // base
        if (HOVER >= 52) label.style.fontSize = '14px';
        if (HOVER >= 60) label.style.fontSize = '16px';
      } else {
        cur.classList.remove('is-interactive');
        setSize(cur, BASE);
      }
    });

    // Esconde quando sai da viewport
    window.addEventListener('mouseleave', function(){
      cur.style.opacity = '0';
    });

    // Util: aplica largura/altura
    function setSize(el, d){
      el.style.width = d + 'px';
      el.style.height = d + 'px';
    }
  })();

}); // fim initAKD
