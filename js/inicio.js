/* =========================================================
   INICIO — franja de marcas y productos destacados
   ========================================================= */

(() => {
  SV.iniciar('inicio');
  SV.pintarBanner('inicio.webp', 'SV Detailing - Productos de las mejores marcas');

  const franja = document.getElementById('franja-marcas');
  const destacados = document.getElementById('destacados');
  destacados.innerHTML = SV.cargandoHTML();

  SV.cargarDatos().then(({ productos, marcas }) => {
    /* --- Marcas --- */
    const visibles = marcas.filter(m => SV.marcaVisible(m.nombre));
    franja.innerHTML = visibles.map(m =>
      `<a href="catalogo.html?marca=${encodeURIComponent(m.nombre)}" class="franja__item" aria-label="Ver productos ${SV.esc(m.nombre)}">
        ${SV.logoMarca(m, 'fondo-oscuro', 'franja__logo')}
      </a>`).join('');
    activarFlechas('franja-marcas', 'franja-anterior', 'franja-siguiente');

    /* --- Destacados (si no hay marcados, muestra los primeros 8) --- */
    let lista = productos.filter(p => p.destacado);
    if (!lista.length) lista = productos.slice(0, 8);
    lista = lista.sort((a, b) => (a.estado === 'SIN STOCK') - (b.estado === 'SIN STOCK'));
    destacados.innerHTML = lista.length
      ? lista.map(p => SV.tarjetaHTML(p, 'oscura')).join('')
      : '<div class="mensaje-vacio mensaje-vacio--oscuro">Pronto vas a ver acá nuestros productos destacados.</div>';
  }).catch(err => {
    console.error(err);
    destacados.innerHTML = SV.errorHTML();
  });

  // Flechas para desplazar una franja horizontal
  function activarFlechas(idPista, idAnt, idSig) {
    const pista = document.getElementById(idPista);
    const ant = document.getElementById(idAnt);
    const sig = document.getElementById(idSig);
    const revisar = () => {
      const max = pista.scrollWidth - pista.clientWidth - 2;
      ant.hidden = pista.scrollLeft <= 2;
      sig.hidden = pista.scrollLeft >= max;
    };
    ant.addEventListener('click', () => pista.scrollBy({ left: -pista.clientWidth * 0.8, behavior: 'smooth' }));
    sig.addEventListener('click', () => pista.scrollBy({ left: pista.clientWidth * 0.8, behavior: 'smooth' }));
    pista.addEventListener('scroll', revisar, { passive: true });
    window.addEventListener('resize', revisar);
    pista.querySelectorAll('img').forEach(i => i.addEventListener('load', revisar));
    revisar();
  }
})();
