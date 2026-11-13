/* =========================================================
   MARCAS — tarjetas con logo y descripción
   ========================================================= */

(() => {
  SV.iniciar('marcas');
  SV.pintarBanner('marcas.webp', 'Marcas - Las mejores marcas en detailing');

  const grilla = document.getElementById('grilla-marcas');
  grilla.innerHTML = SV.cargandoHTML('Cargando marcas…');

  SV.cargarDatos().then(({ productos, marcas }) => {
    const lista = marcas.filter(m => SV.marcaVisible(m.nombre));
    if (!lista.length) {
      grilla.innerHTML = '<div class="mensaje-vacio">Todavía no hay marcas cargadas.</div>';
      return;
    }
    grilla.innerHTML = lista.map(m => {
      const n = productos.filter(p => p.marca.toUpperCase() === m.nombre.toUpperCase()).length;
      return `<a href="catalogo.html?marca=${encodeURIComponent(m.nombre)}" class="marca-tarjeta">
        <div class="marca-tarjeta__logo">${SV.logoMarca(m, 'fondo-claro', 'marca-tarjeta__img')}</div>
        <div class="marca-tarjeta__texto">
          <p>${SV.esc(m.descripcion)}</p>
          <span class="marca-tarjeta__cant">${n ? `${n} ${n === 1 ? 'producto' : 'productos'}` : 'Próximamente'}</span>
        </div>
        <span class="marca-tarjeta__flecha" aria-hidden="true">›</span>
      </a>`;
    }).join('');
  }).catch(err => {
    console.error(err);
    grilla.innerHTML = SV.errorHTML();
  });
})();
