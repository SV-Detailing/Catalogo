/* =========================================================
   SV DETAILING — NÚCLEO DE LA TIENDA
   Carga de datos del Sheet, carrito, encabezado, pie de
   página y tarjetas de producto. Lo usan todas las páginas.
   ========================================================= */

const SV = (() => {

  /* ---------------- UTILIDADES ---------------- */

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const sinAcentos = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const normalizar = s => sinAcentos(s).toLowerCase().trim();
  const slug = s => normalizar(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const precio = n => '$ ' + Math.round(Number(n) || 0).toLocaleString('es-AR');

  // Convierte "28990", "28.990", "$ 28.990,00" o "28990.5" en número
  function aNumero(v) {
    let s = String(v == null ? '' : v).replace(/[^\d,.-]/g, '');
    if (!s) return 0;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  const param = nombre => new URLSearchParams(location.search).get(nombre) || '';

  /* ---------------- LECTURA DE CSV ---------------- */

  function leerCSV(texto) {
    const filas = [];
    let fila = [], campo = '', comillas = false;
    texto = String(texto).replace(/^﻿/, '');
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (comillas) {
        if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') comillas = false;
        else campo += c;
      } else if (c === '"') comillas = true;
      else if (c === ',') { fila.push(campo); campo = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && texto[i + 1] === '\n') i++;
        fila.push(campo); filas.push(fila); fila = []; campo = '';
      } else campo += c;
    }
    if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }

    const limpias = filas.filter(f => f.some(v => String(v).trim() !== ''));
    if (!limpias.length) return [];
    const enc = limpias[0].map(h => sinAcentos(h).toUpperCase().trim().replace(/\s+/g, '_'));
    return limpias.slice(1).map(f => {
      const o = {};
      enc.forEach((h, i) => { if (h) o[h] = String(f[i] == null ? '' : f[i]).trim(); });
      return o;
    });
  }

  /* ---------------- CARGA DE DATOS ---------------- */

  function normalizarEstado(e) {
    const s = sinAcentos(e).toUpperCase();
    if (s.includes('SIN')) return 'SIN STOCK';
    if (s.includes('ULTIMA') || s.includes('POCO')) return 'ÚLTIMAS UNIDADES';
    return 'DISPONIBLE';
  }

  function armarProducto(f) {
    const precioNormal = aNumero(f.PRECIO);
    const promo = aNumero(f.PRECIO_PROMO);
    return {
      codigo: f.CODIGO,
      visible: (f.VISIBLE || 'SI').toUpperCase() !== 'NO',
      seccion: (f.SECCION || 'PRODUCTO').toUpperCase(),
      categoria: f.CATEGORIA || '',
      marca: f.MARCA || '',
      nombre: f.NOMBRE || f.CODIGO,
      descripcion: f.DESCRIPCION || '',
      presentacion: f.PRESENTACION || '',
      precio: promo > 0 && promo < precioNormal ? promo : precioNormal,
      precioAnterior: promo > 0 && promo < precioNormal ? precioNormal : 0,
      estado: normalizarEstado(f.ESTADO),
      destacado: (f.DESTACADO || '').toUpperCase() === 'SI',
      foto: f.FOTO || '',
      orden: f.ORDEN === '' || f.ORDEN == null ? 9999 : aNumero(f.ORDEN),
      incluyeTexto: f.INCLUYE || '',
      items: []
    };
  }

  /* Kits y combos: la columna INCLUYE lista lo que trae, separado por ";".
     Cada parte es un código del catálogo (ej: TS 6792031 DF) o un texto libre
     (ej: Aplicador de Espuma Alta Densidad). Se puede indicar cantidad: 2x CODIGO */
  const claveCodigo = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const PESO_ESTADO = { 'DISPONIBLE': 0, 'ÚLTIMAS UNIDADES': 1, 'SIN STOCK': 2 };

  function armarKits(productos) {
    const porCodigo = new Map(productos.map(p => [claveCodigo(p.codigo), p]));
    productos.forEach(k => {
      if (!k.incluyeTexto) return;
      k.items = k.incluyeTexto.split(/[;\n]+/).map(t => t.trim()).filter(Boolean).map(t => {
        const m = t.match(/^(\d+)\s*[xX×]\s+(.+)$/);
        const cantidad = m ? parseInt(m[1], 10) : 1;
        const texto = m ? m[2].trim() : t;
        return { cantidad, texto, producto: porCodigo.get(claveCodigo(texto)) || null };
      });
      // El estado del kit sale de sus productos: si falta uno, el kit no está disponible
      const conocidos = k.items.filter(i => i.producto);
      if (conocidos.length) {
        k.estado = conocidos.map(i => i.producto.estado)
          .reduce((a, b) => (PESO_ESTADO[b] > PESO_ESTADO[a] ? b : a), 'DISPONIBLE');
      }
      // Precio comprando por separado (solo si todos los productos están en el catálogo)
      k.precioSeparado = k.items.every(i => i.producto)
        ? k.items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0) : 0;
    });
    return productos;
  }

  function armarMarca(f) {
    return {
      nombre: f.MARCA || '',
      logo: f.LOGO || '',
      descripcion: f.DESCRIPCION || '',
      orden: f.ORDEN === '' || f.ORDEN == null ? 9999 : aNumero(f.ORDEN),
      visible: (f.VISIBLE || 'SI').toUpperCase() !== 'NO'
    };
  }

  function leerCache(clave) {
    try {
      const c = JSON.parse(sessionStorage.getItem(clave));
      if (c && Date.now() - c.t < CONFIG.MINUTOS_CACHE * 60000) return c.d;
    } catch (e) { /* sin caché */ }
    return null;
  }
  function guardarCache(clave, datos) {
    try { sessionStorage.setItem(clave, JSON.stringify({ t: Date.now(), d: datos })); } catch (e) { /* sin caché */ }
  }

  async function traerCSV(url, ejemplo, clave) {
    if (!url) return leerCSV(ejemplo);
    const enCache = leerCache(clave);
    if (enCache) return enCache;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('El Sheet respondió ' + r.status);
    const filas = leerCSV(await r.text());
    guardarCache(clave, filas);
    return filas;
  }

  let promesaDatos = null;
  function cargarDatos() {
    if (!promesaDatos) {
      promesaDatos = Promise.all([
        traerCSV(CONFIG.URL_CATALOGO, EJEMPLO_CATALOGO, 'sv-cat'),
        traerCSV(CONFIG.URL_MARCAS, EJEMPLO_MARCAS, 'sv-mar').catch(() => leerCSV(EJEMPLO_MARCAS))
      ]).then(([cat, mar]) => {
        if (!CONFIG.URL_CATALOGO) console.info('SV Detailing: usando datos de ejemplo (CONFIG.URL_CATALOGO está vacío).');
        const todos = cat.map(armarProducto).filter(p => p.codigo);
        armarKits(todos);   // los kits pueden incluir productos ocultos
        const productos = todos.filter(p => p.visible).sort((a, b) => a.orden - b.orden);
        const marcas = mar.map(armarMarca)
          .filter(m => m.nombre && m.visible)
          .sort((a, b) => a.orden - b.orden);
        return { productos, marcas };
      });
    }
    return promesaDatos;
  }

  const marcaVisible = m => !CONFIG.MARCAS_OCULTAS.map(x => x.toUpperCase()).includes(String(m).toUpperCase());

  /* ---------------- IMÁGENES CON RESPALDO ----------------
     Prueba el nombre del Sheet y, si no existe, el mismo
     nombre en .webp / .png / .jpg / .svg. Si no hay ninguno,
     muestra el logo SV (productos) o el nombre (marcas).     */

  function variantes(carpeta, archivo) {
    if (!archivo) return [];
    const base = archivo.replace(/\.[a-z0-9]+$/i, '');
    return [...new Set([archivo, base + '.webp', base + '.png', base + '.jpg', base + '.svg'])]
      .map(a => carpeta + a);
  }

  function imgHTML(lista, alt, clase, textoRespaldo) {
    const [primera, ...resto] = lista;
    const datosTexto = textoRespaldo ? ` data-texto="${esc(textoRespaldo)}"` : '';
    if (!primera) return respaldoHTML(alt, clase, textoRespaldo);
    return `<img src="${esc(primera)}" alt="${esc(alt)}" class="${clase}" loading="lazy"
      data-resto="${esc(resto.join('|'))}"${datosTexto} onerror="SV.siguienteImg(this)">`;
  }

  function respaldoHTML(alt, clase, texto) {
    if (texto) return `<span class="${clase} logo-texto">${esc(texto)}</span>`;
    return `<img src="img/logo/logo.svg" alt="${esc(alt)}" class="${clase} sin-foto">`;
  }

  function siguienteImg(img) {
    const resto = (img.dataset.resto || '').split('|').filter(Boolean);
    if (resto.length) {
      img.dataset.resto = resto.slice(1).join('|');
      img.src = resto[0];
      return;
    }
    img.onerror = null;
    const temp = document.createElement('div');
    temp.innerHTML = respaldoHTML(img.alt, img.className.replace('sin-foto', '').trim(), img.dataset.texto);
    img.replaceWith(temp.firstElementChild);
  }

  // Primero busca la foto con el nombre del código (ej: 7839709163425.webp);
  // si no existe, usa el nombre de la columna FOTO del Sheet.
  const fotoProducto = (p, clase = 'tarjeta__foto') => {
    const porCodigo = 'img/productos/' + slug(p.codigo) + '.webp';
    const lista = [porCodigo, ...variantes('img/productos/', p.foto).filter(u => u !== porCodigo)];
    return imgHTML(lista, p.nombre, clase);
  };

  const logoMarca = (m, fondo, clase = 'marca-logo') =>
    imgHTML(variantes(`img/marcas/${fondo}/`, m.logo || slug(m.nombre) + '.svg'), m.nombre, clase, m.nombre);

  /* ---------------- CARRITO ---------------- */

  const CLAVE_CARRITO = 'sv-carrito';

  function leerCarrito() {
    try {
      const c = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
      return Array.isArray(c) ? c.filter(i => i && i.codigo && i.cantidad > 0) : [];
    } catch (e) { return []; }
  }

  function guardarCarrito(items) {
    try { localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items)); } catch (e) { /* sin almacenamiento */ }
    actualizarContador();
    document.dispatchEvent(new CustomEvent('carrito-cambio'));
  }

  function agregar(codigo, cantidad = 1) {
    const items = leerCarrito();
    const it = items.find(i => i.codigo === codigo);
    if (it) it.cantidad += cantidad; else items.push({ codigo, cantidad });
    guardarCarrito(items);
  }

  function cambiarCantidad(codigo, cantidad) {
    let items = leerCarrito();
    if (cantidad <= 0) items = items.filter(i => i.codigo !== codigo);
    else { const it = items.find(i => i.codigo === codigo); if (it) it.cantidad = cantidad; }
    guardarCarrito(items);
  }

  const quitar = codigo => cambiarCantidad(codigo, 0);
  const vaciar = () => guardarCarrito([]);
  const totalUnidades = () => leerCarrito().reduce((s, i) => s + i.cantidad, 0);

  function actualizarContador() {
    const n = totalUnidades();
    document.querySelectorAll('.carrito-contador').forEach(el => {
      el.textContent = n > 99 ? '99+' : n;
      el.hidden = n === 0;
    });
  }

  /* ---------------- WHATSAPP ---------------- */

  const linkWhatsApp = texto => `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(texto)}`;

  const textoConsulta = p =>
    `¡Hola SV Detailing! Quería consultar por este producto que figura sin stock:\n` +
    `${p.marca} ${p.nombre} ${p.presentacion} (código ${p.codigo}).\n¿Cuándo les vuelve a ingresar?`;

  /* ---------------- AVISO FLOTANTE ---------------- */

  let timerAviso;
  function aviso(texto) {
    let el = document.getElementById('aviso');
    if (!el) {
      el = document.createElement('div');
      el.id = 'aviso';
      el.className = 'aviso';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.innerHTML = texto;
    el.classList.add('aviso--visible');
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => el.classList.remove('aviso--visible'), 2600);
  }

  /* ---------------- ENCABEZADO Y PIE ---------------- */

  const MENU = [
    ['inicio', 'Inicio', 'index.html'],
    ['catalogo', 'Catálogo', 'catalogo.html'],
    ['marcas', 'Marcas', 'marcas.html'],
    ['kits', 'Kits', 'kits.html'],
    ['accesorios', 'Accesorios', 'accesorios.html'],
    ['servicios', 'Servicios', 'servicios.html']
  ];

  function pintarEncabezado(pagina) {
    const el = document.getElementById('encabezado');
    if (!el) return;
    el.innerHTML = `
      <div class="encabezado__fila contenedor">
        <a href="index.html" class="encabezado__logo" aria-label="SV Detailing - Inicio">
          <img src="img/logo/logo.svg" alt="SV Detailing">
        </a>
        <form class="buscador" action="catalogo.html" role="search">
          <img src="img/iconos/icono-buscar.png" alt="" class="buscador__icono">
          <input type="search" name="buscar" class="buscador__campo" id="campo-buscar"
                 placeholder="Buscar productos, marcas, categorías..." autocomplete="off"
                 aria-label="Buscar productos" value="${esc(param('buscar'))}">
        </form>
        <a href="carrito.html" class="encabezado__carrito ${pagina === 'carrito' ? 'activo' : ''}" aria-label="Ver carrito">
          <img src="img/iconos/icono-carrito.png" alt="">
          <span class="carrito-contador" hidden>0</span>
        </a>
      </div>
      <nav class="menu" aria-label="Menú principal">
        <ul class="menu__lista contenedor">
          ${MENU.map(([id, txt, url]) =>
            `<li><a href="${url}" class="menu__link ${pagina === id ? 'activo' : ''}">${txt}</a></li>`).join('')}
        </ul>
      </nav>`;
    actualizarContador();
  }

  function pintarPie() {
    const el = document.getElementById('pie');
    if (!el) return;
    const fb = CONFIG.FACEBOOK_URL
      ? `<a href="${esc(CONFIG.FACEBOOK_URL)}" target="_blank" rel="noopener">${esc(CONFIG.FACEBOOK_TEXTO)}</a>`
      : esc(CONFIG.FACEBOOK_TEXTO);
    const mapa = 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(CONFIG.DIRECCION + ', La Rioja, Argentina');
    el.innerHTML = `
      <div class="pie__grilla contenedor">
        <div class="pie__marca">
          <img src="img/logo/logo.svg" alt="SV Detailing" class="pie__logo">
          <p>${esc(CONFIG.TEXTO_PIE)}</p>
        </div>
        <div>
          <h3 class="pie__titulo">Sucursal</h3>
          <p><a href="${mapa}" target="_blank" rel="noopener">${esc(CONFIG.DIRECCION)}<br>${esc(CONFIG.CIUDAD)}</a></p>
        </div>
        <div>
          <h3 class="pie__titulo">Contacto</h3>
          <p>Whatsapp: <a href="https://wa.me/${CONFIG.WHATSAPP}" target="_blank" rel="noopener">${esc(CONFIG.WHATSAPP_TEXTO)}</a><br>
             Facebook: ${fb}<br>
             Instagram: <a href="${esc(CONFIG.INSTAGRAM_URL)}" target="_blank" rel="noopener">${esc(CONFIG.INSTAGRAM_TEXTO)}</a></p>
        </div>
      </div>
      <div class="pie__base contenedor">© ${new Date().getFullYear()} SV Detailing · La Rioja, Argentina</div>`;
  }

  /* ---------------- TARJETAS DE PRODUCTO ---------------- */

  const CLASE_ESTADO = {
    'DISPONIBLE': 'estado--ok',
    'ÚLTIMAS UNIDADES': 'estado--pocas',
    'SIN STOCK': 'estado--sin'
  };

  const estadoHTML = p => `<span class="estado ${CLASE_ESTADO[p.estado]}">${p.estado}</span>`;

  function precioHTML(p) {
    if (!p.precioAnterior) return `<div class="precio"><span class="precio__actual">${precio(p.precio)}</span></div>`;
    const desc = Math.round((1 - p.precio / p.precioAnterior) * 100);
    return `<div class="precio">
      <span class="precio__anterior">${precio(p.precioAnterior)}</span>
      <span class="precio__actual precio__actual--promo">${precio(p.precio)}</span>
      <span class="precio__desc">-${desc}%</span>
    </div>`;
  }

  function botonHTML(p, texto = 'Agregar') {
    if (p.estado === 'SIN STOCK') {
      return `<a class="boton boton--consultar" href="${linkWhatsApp(textoConsulta(p))}" target="_blank" rel="noopener">Consultar</a>`;
    }
    return `<button type="button" class="boton boton--agregar" data-agregar="${esc(p.codigo)}">
      ${texto} <svg class="icono-boton" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="19" r="1.5" fill="currentColor"/><circle cx="17" cy="19" r="1.5" fill="currentColor"/></svg>
    </button>`;
  }

  const esKit = p => p.items && p.items.length > 0;
  const unidadesKit = p => p.items.reduce((s, i) => s + i.cantidad, 0);
  const textoDescripcion = p => esKit(p)
    ? `Incluye ${unidadesKit(p)} productos`
    : [p.descripcion, p.presentacion].filter(Boolean).join(' · ');

  // variante: 'h' (foto a la izquierda), 'v' (foto arriba), 'oscura' (destacados del inicio), 'mini' (sugerencias)
  function tarjetaHTML(p, variante = 'v') {
    const etiquetaPromo = p.precioAnterior
      ? `<span class="tarjeta__promo">-${Math.round((1 - p.precio / p.precioAnterior) * 100)}%</span>` : '';
    const kit = esKit(p);
    const atributosKit = kit
      ? ` data-kit="${esc(p.codigo)}" tabindex="0" role="button" aria-label="Ver detalle de ${esc(p.nombre)}"` : '';
    return `<article class="tarjeta tarjeta--${variante} ${p.estado === 'SIN STOCK' ? 'tarjeta--agotada' : ''} ${kit ? 'tarjeta--kit' : ''}"${atributosKit}>
      <div class="tarjeta__media">${etiquetaPromo}${fotoProducto(p)}${kit ? '<span class="tarjeta__ver">Ver combo</span>' : ''}</div>
      <div class="tarjeta__info">
        ${marcaVisible(p.marca) ? `<span class="tarjeta__marca">${esc(p.marca)}</span>` : ''}
        <h3 class="tarjeta__nombre">${esc(p.nombre)}</h3>
        <p class="tarjeta__desc">${esc(textoDescripcion(p))}</p>
        ${variante === 'mini' ? '' : estadoHTML(p)}
        <div class="tarjeta__pie">
          ${precioHTML(p)}
          ${botonHTML(p, variante === 'v' ? 'Agregar al carrito' : 'Agregar')}
        </div>
      </div>
    </article>`;
  }

  // Un solo escuchador para todos los botones "Agregar" de la página
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-agregar]');
    if (!b) return;
    agregar(b.dataset.agregar, 1);
    cargarDatos().then(({ productos }) => {
      const p = productos.find(x => x.codigo === b.dataset.agregar);
      aviso(`<strong>Agregado:</strong> ${esc(p ? p.nombre : 'producto')} · <a href="carrito.html">Ver carrito</a>`);
    });
    b.classList.add('boton--ok');
    setTimeout(() => b.classList.remove('boton--ok'), 700);
  });

  /* ---------------- DETALLE DE KIT / COMBO ----------------
     Al tocar la tarjeta de un kit se abre una vista con un carrusel:
     primero la foto del combo y después cada producto que incluye. */

  const nombreItem = i => i.producto
    ? [i.producto.nombre, /^(1\s*(unidad|kit|set|combo)|x1)$/i.test(i.producto.presentacion) ? '' : i.producto.presentacion]
        .filter(Boolean).join(' ')
    : i.texto;

  function fotoItem(i, clase) {
    if (i.producto) return fotoProducto(i.producto, clase);
    return imgHTML(['img/productos/' + slug(i.texto) + '.webp'], i.texto, clase);
  }

  const FLECHA = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function htmlKit(k) {
    const diapositivas = [
      `<figure class="kit-slide">
         <div class="kit-slide__foto">${fotoProducto(k, 'kit-slide__img')}</div>
         <figcaption class="kit-slide__pie"><strong>${esc(k.nombre)}</strong><span>${precio(k.precio)}</span></figcaption>
       </figure>`,
      ...k.items.map(i => `<figure class="kit-slide">
         <div class="kit-slide__foto">${fotoItem(i, 'kit-slide__img')}</div>
         <figcaption class="kit-slide__pie">
           ${i.producto && marcaVisible(i.producto.marca) ? `<em>${esc(i.producto.marca)}</em>` : ''}
           <strong>${i.cantidad > 1 ? i.cantidad + ' x ' : ''}${esc(nombreItem(i))}</strong>
           ${i.producto && i.producto.descripcion ? `<span>${esc(i.producto.descripcion)}</span>` : ''}
         </figcaption>
       </figure>`)
    ];
    const ahorro = k.precioSeparado > k.precio
      ? `<p class="kit__ahorro">Por separado: <s>${precio(k.precioSeparado)}</s> · <strong>Ahorrás ${precio(k.precioSeparado - k.precio)}</strong></p>` : '';
    return `<div class="kit__caja" role="dialog" aria-modal="true" aria-labelledby="kit-titulo">
      <button type="button" class="kit__cerrar" data-kit-cerrar aria-label="Cerrar">${FLECHA('M6 6l12 12M18 6L6 18')}</button>
      <div class="kit__carrusel">
        <div class="kit__pista" id="kit-pista">${diapositivas.join('')}</div>
        <button type="button" class="kit__flecha kit__flecha--izq" data-kit-mover="-1" aria-label="Anterior">${FLECHA('M15 5l-7 7 7 7')}</button>
        <button type="button" class="kit__flecha kit__flecha--der" data-kit-mover="1" aria-label="Siguiente">${FLECHA('M9 5l7 7-7 7')}</button>
        <div class="kit__puntos">${diapositivas.map((_, n) =>
          `<button type="button" class="kit__punto" data-kit-ir="${n}" aria-label="Foto ${n + 1}"></button>`).join('')}</div>
      </div>
      <div class="kit__info">
        ${marcaVisible(k.marca) ? `<span class="tarjeta__marca">${esc(k.marca)}</span>` : ''}
        <h2 id="kit-titulo" class="kit__titulo">${esc(k.nombre)}</h2>
        ${estadoHTML(k)}
        ${k.descripcion ? `<p class="kit__desc">${esc(k.descripcion)}</p>` : ''}
        <h3 class="kit__subtitulo">Incluye</h3>
        <ul class="kit__lista">${k.items.map((i, n) => `<li>
          <button type="button" data-kit-ir="${n + 1}">
            <span class="kit__mini">${fotoItem(i, 'kit__mini-img')}</span>
            <span>${i.cantidad} x ${esc(nombreItem(i))}</span>
          </button></li>`).join('')}</ul>
        ${ahorro}
        <div class="kit__pie">${precioHTML(k)}${botonHTML(k, 'Agregar al carrito')}</div>
      </div>
    </div>`;
  }

  let kitAbierto = null;

  function irDiapositiva(n) {
    const pista = document.getElementById('kit-pista');
    if (!pista) return;
    const total = pista.children.length;
    n = (n + total) % total;
    pista.scrollTo({ left: pista.children[n].offsetLeft - pista.offsetLeft, behavior: 'smooth' });
  }

  function marcarPunto() {
    const pista = document.getElementById('kit-pista');
    if (!pista || !kitAbierto) return;
    const n = Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth));
    kitAbierto.querySelectorAll('.kit__punto').forEach((b, i) => b.classList.toggle('activo', i === n));
    kitAbierto.dataset.actual = n;
  }

  function cambiarURLKit(codigo) {
    try {
      const u = new URL(location.href);
      if (codigo) u.searchParams.set('kit', codigo); else u.searchParams.delete('kit');
      history.replaceState(null, '', u);
    } catch (e) { /* sin historial */ }
  }

  function abrirKit(codigo) {
    cargarDatos().then(({ productos }) => {
      const k = productos.find(p => p.codigo === codigo);
      if (!k || !esKit(k)) return;
      cerrarKit();
      kitAbierto = document.createElement('div');
      kitAbierto.className = 'kit';
      kitAbierto.innerHTML = htmlKit(k);
      document.body.appendChild(kitAbierto);
      document.body.classList.add('sin-scroll');
      document.getElementById('kit-pista').addEventListener('scroll', () => requestAnimationFrame(marcarPunto), { passive: true });
      marcarPunto();
      kitAbierto.querySelector('.kit__cerrar').focus();
      cambiarURLKit(codigo);
    });
  }

  function cerrarKit() {
    if (!kitAbierto) return;
    kitAbierto.remove();
    kitAbierto = null;
    document.body.classList.remove('sin-scroll');
    cambiarURLKit('');
  }

  document.addEventListener('click', e => {
    if (kitAbierto) {
      if (e.target === kitAbierto || e.target.closest('[data-kit-cerrar]')) return cerrarKit();
      const mover = e.target.closest('[data-kit-mover]');
      if (mover) return irDiapositiva(Number(kitAbierto.dataset.actual || 0) + Number(mover.dataset.kitMover));
      const ir = e.target.closest('[data-kit-ir]');
      if (ir) return irDiapositiva(Number(ir.dataset.kitIr));
      return;
    }
    const t = e.target.closest('[data-kit]');
    if (t && !e.target.closest('[data-agregar], a')) abrirKit(t.dataset.kit);
  });

  document.addEventListener('keydown', e => {
    if (kitAbierto) {
      if (e.key === 'Escape') cerrarKit();
      if (e.key === 'ArrowRight') irDiapositiva(Number(kitAbierto.dataset.actual || 0) + 1);
      if (e.key === 'ArrowLeft') irDiapositiva(Number(kitAbierto.dataset.actual || 0) - 1);
      return;
    }
    const t = e.target.closest && e.target.closest('[data-kit]');
    if (t && (e.key === 'Enter' || e.key === ' ') && !e.target.closest('[data-agregar], a')) {
      e.preventDefault();
      abrirKit(t.dataset.kit);
    }
  });

  /* ---------------- BANNER ---------------- */

  function pintarBanner(archivo, alt) {
    const el = document.getElementById('banner');
    if (!el) return;
    el.innerHTML = `<img src="img/banners/${archivo}" alt="${esc(alt)}" class="banner__img" fetchpriority="high">`;
  }

  /* ---------------- ESTADO DE CARGA / ERROR ---------------- */

  const cargandoHTML = (texto = 'Cargando productos…') =>
    `<div class="mensaje-carga"><span class="spinner"></span>${texto}</div>`;

  const errorHTML = () =>
    `<div class="mensaje-vacio">No pudimos cargar los productos. <button type="button" class="boton boton--borde" onclick="location.reload()">Reintentar</button></div>`;

  /* ---------------- INICIO DE CADA PÁGINA ---------------- */

  function iniciar(pagina) {
    pintarEncabezado(pagina);
    pintarPie();
    window.addEventListener('storage', e => { if (e.key === CLAVE_CARRITO) actualizarContador(); });
    // Link directo a un combo: catalogo.html?kit=CODIGO
    if (param('kit')) abrirKit(param('kit'));
  }

  return {
    esc, normalizar, slug, precio, param,
    cargarDatos, marcaVisible,
    siguienteImg, fotoProducto, logoMarca,
    leerCarrito, agregar, cambiarCantidad, quitar, vaciar, totalUnidades,
    linkWhatsApp, aviso,
    tarjetaHTML, estadoHTML, textoDescripcion, esKit, nombreItem, abrirKit,
    pintarBanner, cargandoHTML, errorHTML,
    iniciar
  };
})();
