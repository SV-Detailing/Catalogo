/* =========================================================
   CARRITO — lista, resumen y envío del pedido por WhatsApp
   ========================================================= */

(() => {
  SV.iniciar('carrito');
  SV.pintarBanner('carrito.webp', 'Carrito - Revisá tus productos y completá tu compra');

  const $ = id => document.getElementById(id);
  let PRODUCTOS = [];

  // Une lo guardado en el carrito con los datos actuales del Sheet
  function lineas() {
    const items = SV.leerCarrito();
    const validas = [];
    items.forEach(i => {
      const p = PRODUCTOS.find(x => x.codigo === i.codigo);
      if (p) validas.push({ p, cantidad: i.cantidad, subtotal: p.precio * i.cantidad });
    });
    // Si algún producto ya no está en el Sheet, se quita del carrito
    if (validas.length !== items.length) {
      const codigos = validas.map(l => l.p.codigo);
      try { localStorage.setItem('sv-carrito', JSON.stringify(items.filter(i => codigos.includes(i.codigo)))); } catch (e) { /* nada */ }
    }
    return validas;
  }

  function pintar() {
    const ls = lineas();
    const unidades = ls.reduce((s, l) => s + l.cantidad, 0);
    const total = ls.reduce((s, l) => s + l.subtotal, 0);

    $('titulo-carrito').textContent = `Productos en tu carrito (${unidades})`;

    if (!ls.length) {
      $('tabla-carrito').innerHTML = `<div class="mensaje-vacio">
        Tu carrito está vacío.
        <div class="mensaje-vacio__acciones"><a href="catalogo.html" class="boton boton--agregar">Ver catálogo</a></div>
      </div>`;
      $('acciones-carrito').hidden = true;
    } else {
      $('acciones-carrito').hidden = false;
      $('tabla-carrito').innerHTML = `
        <div class="carrito-fila carrito-fila--cabecera" aria-hidden="true">
          <span>Producto</span><span>Precio unitario</span><span>Cantidad</span><span>Subtotal</span><span></span>
        </div>
        ${ls.map(({ p, cantidad, subtotal }) => `
        <div class="carrito-fila">
          <div class="carrito-prod">
            <div class="carrito-prod__foto">${SV.fotoProducto(p, 'carrito-prod__img')}</div>
            <div>
              ${SV.marcaVisible(p.marca) ? `<span class="carrito-prod__marca">${SV.esc(p.marca)}</span>` : ''}
              <strong class="carrito-prod__nombre">${SV.esc(p.nombre)}</strong>
              <span class="carrito-prod__desc">${SV.esc(SV.textoDescripcion(p))}</span>
              ${p.estado !== 'DISPONIBLE' ? SV.estadoHTML(p) : ''}
            </div>
          </div>
          <div class="carrito-dato" data-rotulo="Precio">${SV.precio(p.precio)}</div>
          <div class="carrito-dato" data-rotulo="Cantidad">
            <div class="cantidad">
              <button type="button" data-menos="${SV.esc(p.codigo)}" aria-label="Restar uno">−</button>
              <input type="number" min="1" value="${cantidad}" data-cant="${SV.esc(p.codigo)}" aria-label="Cantidad de ${SV.esc(p.nombre)}">
              <button type="button" data-mas="${SV.esc(p.codigo)}" aria-label="Sumar uno">+</button>
            </div>
          </div>
          <div class="carrito-dato carrito-dato--subtotal" data-rotulo="Subtotal">${SV.precio(subtotal)}</div>
          <button type="button" class="carrito-quitar" data-quitar="${SV.esc(p.codigo)}" aria-label="Quitar ${SV.esc(p.nombre)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>`).join('')}`;
    }

    $('resumen-subtotal-texto').textContent = `Subtotal (${unidades} ${unidades === 1 ? 'producto' : 'productos'})`;
    $('resumen-subtotal').textContent = SV.precio(total);
    $('resumen-total').textContent = SV.precio(total);
    $('finalizar').disabled = !ls.length;

    pintarSugerencias(ls.map(l => l.p.codigo));
  }

  function pintarSugerencias(enCarrito) {
    const lista = PRODUCTOS
      .filter(p => !enCarrito.includes(p.codigo) && p.estado !== 'SIN STOCK')
      .sort((a, b) => (b.destacado - a.destacado) || (a.orden - b.orden))
      .slice(0, 10);
    $('bloque-sugerencias').hidden = !lista.length;
    $('sugerencias').innerHTML = lista.map(p => SV.tarjetaHTML(p, 'mini')).join('');
    revisarFlechas();
  }

  /* ---------- Mensaje de WhatsApp ---------- */
  function mensajePedido() {
    const ls = lineas();
    const total = ls.reduce((s, l) => s + l.subtotal, 0);
    const nombre = $('cliente-nombre').value.trim();
    const entrega = $('cliente-entrega').value;
    const nota = $('cliente-nota').value.trim();

    let txt = '¡Hola SV Detailing! Quiero hacer este pedido:\n\n';
    ls.forEach(({ p, cantidad, subtotal }) => {
      const marca = SV.marcaVisible(p.marca) ? p.marca + ' ' : '';
      txt += `• ${cantidad} x ${marca}${p.nombre}${p.presentacion ? ' ' + p.presentacion : ''} (${p.codigo}) — ${SV.precio(subtotal)}\n`;
    });
    txt += `\n*Total: ${SV.precio(total)}*\n`;
    if (nombre) txt += `\nNombre: ${nombre}`;
    txt += `\nEntrega: ${entrega}`;
    if (nota) txt += `\nComentario: ${nota}`;
    txt += '\n\n¿Me confirman disponibilidad y forma de pago?';
    return txt;
  }

  /* ---------- Eventos ---------- */
  function eventos() {
    $('tabla-carrito').addEventListener('click', e => {
      const t = e.target.closest('button');
      if (!t) return;
      const actual = c => (SV.leerCarrito().find(i => i.codigo === c) || { cantidad: 0 }).cantidad;
      if (t.dataset.mas) SV.cambiarCantidad(t.dataset.mas, actual(t.dataset.mas) + 1);
      if (t.dataset.menos) SV.cambiarCantidad(t.dataset.menos, Math.max(1, actual(t.dataset.menos) - 1));
      if (t.dataset.quitar) SV.quitar(t.dataset.quitar);
    });
    $('tabla-carrito').addEventListener('change', e => {
      if (!e.target.dataset.cant) return;
      SV.cambiarCantidad(e.target.dataset.cant, Math.max(1, parseInt(e.target.value, 10) || 1));
    });
    $('vaciar').addEventListener('click', () => {
      if (confirm('¿Vaciar el carrito?')) SV.vaciar();
    });
    $('finalizar').addEventListener('click', () => {
      if (!lineas().length) return;
      window.open(SV.linkWhatsApp(mensajePedido()), '_blank', 'noopener');
    });
    document.addEventListener('carrito-cambio', pintar);
    window.addEventListener('storage', e => { if (e.key === 'sv-carrito') pintar(); });

    $('sug-anterior').addEventListener('click', () => $('sugerencias').scrollBy({ left: -$('sugerencias').clientWidth * 0.8, behavior: 'smooth' }));
    $('sug-siguiente').addEventListener('click', () => $('sugerencias').scrollBy({ left: $('sugerencias').clientWidth * 0.8, behavior: 'smooth' }));
    $('sugerencias').addEventListener('scroll', revisarFlechas, { passive: true });
    window.addEventListener('resize', revisarFlechas);
  }

  function revisarFlechas() {
    const s = $('sugerencias');
    $('sug-anterior').hidden = s.scrollLeft <= 2;
    $('sug-siguiente').hidden = s.scrollLeft >= s.scrollWidth - s.clientWidth - 2;
  }

  /* ---------- Arranque ---------- */
  $('tabla-carrito').innerHTML = SV.cargandoHTML('Cargando tu carrito…');
  SV.cargarDatos().then(({ productos }) => {
    PRODUCTOS = productos;
    pintar();
    eventos();
  }).catch(err => {
    console.error(err);
    $('tabla-carrito').innerHTML = SV.errorHTML();
  });
})();
