document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if(id.length > 1){
      e.preventDefault();
      document.querySelector(id).scrollIntoView({ behavior:'smooth', block:'start' });
    }
  });
});

const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      en.target.classList.add('in');
      io.unobserve(en.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

<script>
  // =========================================
  // Cursor personalizado — bola branca + negativo em imagens
  // =========================================
  (function(){
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var supportsFine    = window.matchMedia('(pointer: fine)').matches;
    // Suporte ao backdrop-filter (Safari/Chromium ok; Firefox requer flag)
    var supportsBackdrop = window.CSS && (
      CSS.supports('backdrop-filter', 'invert(1)') ||
      CSS.supports('-webkit-backdrop-filter', 'invert(1)')
    );

    if (!supportsFine) return; // não roda em touch
    document.body.classList.add('custom-cursor');

    // cria o elemento da bolinha
    var cur = document.createElement('div');
    cur.className = 'akd-cursor is-hidden';
    document.body.appendChild(cur);

    var x = window.innerWidth/2, y = window.innerHeight/2; // posição atual
    var tx = x, ty = y;                                    // alvo
    var speed = prefersReduced ? 1 : 0.18;                 // suavidade

    function raf(){
      // Interpola posição para um follow suave (ou instantâneo se reduce motion)
      x += (tx - x) * speed;
      y += (ty - y) * speed;
      cur.style.left = x + 'px';
      cur.style.top  = y + 'px';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // atualiza posição e estado
    window.addEventListener('mousemove', function(e){
      tx = e.clientX; ty = e.clientY;
      cur.classList.remove('is-hidden');

      var t = e.target;

      // Está sobre algo "clicável"?
      var isLinkish = !!(t.closest('a, button, .btn, [role="button"]'));
      cur.classList.toggle('is-link', isLinkish);

      // Está sobre texto/editável?
      var isText = !!(t.closest('input, textarea, [contenteditable="true"]'));
      document.body.classList.toggle('over-text', isText);

      // Está sobre imagem?
      // OBS: inclui <img>, <picture>, cards com imagem de fundo (.card),
      // e qualquer elemento marcado manualmente com [data-invertable]
      var isOverImg = !!(t.closest('img, picture, .card, [data-invertable]'));
      // Só ativa o negativo se o navegador suportar backdrop-filter
      document.body.classList.toggle('over-img', isOverImg && supportsBackdrop);
    });

    // esconde quando sai da janela
    window.addEventListener('mouseleave', function(){
      cur.classList.add('is-hidden');
      document.body.classList.remove('over-img','over-text');
    });
  })();
</script>
