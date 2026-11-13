/* =========================================================
   LISTADO DE PRODUCTOS — Catálogo, Accesorios y Kits
   La misma lógica sirve para las tres páginas; cambia qué
   productos muestra y qué categorías aparecen a la izquierda.
   ========================================================= */

(() => {
  const PAGINA = document.body.dataset.pagina;   // catalogo | accesorios | kits

  /* ---------- Íconos de categorías ---------- */
  const ICONOS = {
    todos: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    exterior: '<path d="M3 16v-4l2-5h14l2 5v4"/><path d="M3 12h18"/><circle cx="7" cy="16.5" r="1.5"/><circle cx="17" cy="16.5" r="1.5"/>',
    interior: '<path d="M8 3h5a2 2 0 0 1 2 2v7H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M6 12l-1 6h12l1-6"/><path d="M7 18v3M16 18v3"/>',
    pulido: '<circle cx="12" cy="15" r="6"/><circle cx="12" cy="15" r="2"/><path d="M12 9V3"/>',
    proteccion: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    accesorio: '<path d="M9 3h6v4H9z"/><path d="M8 7h8l1 14H7z"/><path d="M15 4h4v2"/>',
    herramienta: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    kit: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    pad: '<ellipse cx="12" cy="9" rx="8" ry="4"/><path d="M4 9v5c0 2.2 3.6 4 8 4s8-1.8 8-4V9"/>',
    microfibra: '<path d="M4 6h16v4H4zM4 10h16v4H4zM4 14h16v4H4z"/>',
    cepillo: '<path d="M14 3l7 7-4 4-7-7z"/><path d="M10 7l-7 7 4 4 7-7"/>',
    balde: '<path d="M5 8h14l-2 13H7z"/><path d="M5 8c0-3 3-5 7-5s7 2 7 5"/>',
    bolso: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V5h8v3"/>',
    punto: '<circle cx="12" cy="12" r="3"/>'
  };

  function iconoPara(texto) {
    const t = SV.normalizar(texto);
    const pares = [
      ['todos', 'todos'], ['exterior', 'exterior'], ['lavado', 'exterior'], ['interior', 'interior'],
      ['pulido', 'pulido'], ['proteccion', 'proteccion'], ['sellado', 'proteccion'], ['mantenimiento', 'proteccion'],
      ['pads', 'pad'], ['aplicador', 'pad'], ['microfibra', 'microfibra'], ['cepillo', 'cepillo'],
      ['pulverizador', 'accesorio'], ['canon', 'accesorio'], ['espuma', 'accesorio'], ['accesorio', 'accesorio'],
      ['balde', 'balde'], ['herramienta', 'herramienta'], ['maletin', 'bolso'], ['bolso', 'bolso'], ['kit', 'kit']
    ];
    const par = pares.find(([clave]) => t.includes(clave));
    return `<svg class="lateral__icono" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[par ? par[1] : 'punto']}</svg>`;
  }

  /* ---------- Configuración de cada página ---------- */
  const enCategoria = cat => p => SV.normalizar(p.categoria) === SV.normalizar(cat);

  function definirPagina(productos) {
    if (PAGINA === 'accesorios') {
      const base = productos.filter(p => p.seccion === 'ACCESORIO' || p.seccion === 'HERRAMIENTA');
      const extras = [...new Set(base.filter(p => p.seccion === 'ACCESORIO').map(p => p.categoria))]
        .filter(c => c && !CONFIG.CATEGORIAS_ACCESORIO.some(x => SV.normalizar(x) === SV.normalizar(c)));
      return {
        base, titulo: 'Accesorios', tituloLateral: 'Categorías', todos: 'Todos los accesorios',
        categorias: [...CONFIG.CATEGORIAS_ACCESORIO, ...extras].map(c => ({
          id: SV.slug(c), texto: c,
          prueba: SV.normalizar(c) === 'herramientas' ? (p => p.seccion === 'HERRAMIENTA') : enCategoria(c)
        })),
        variante: 'v', filtroMarcas: false, logosMarcas: false
      };
    }
    if (PAGINA === 'kits') {
      const base = productos.filter(p => p.seccion === 'KIT');
      const extras = [...new Set(base.map(p => p.categoria))]
        .filter(c => c && !CONFIG.CATEGORIAS_KIT.some(x => SV.normalizar(x) === SV.normalizar(c)));
      return {
        base, titulo: 'Kits', tituloLateral: 'Categorías de kits', todos: 'Todos los kits',
        categorias: [...CONFIG.CATEGORIAS_KIT, ...extras].map(c => ({
          id: SV.slug(c), texto: c.replace(/^kit\s+/i, ''), prueba: enCategoria(c)
        })),
        variante: 'v', filtroMarcas: false, logosMarcas: false
      };
    }
    // Catálogo: todo
    const extras = [...new Set(productos.filter(p => p.seccion === 'PRODUCTO').map(p => p.categoria))]
      .filter(c => c && !CONFIG.CATEGORIAS_PRODUCTO.some(x => SV.normalizar(x) === SV.normalizar(c)));
    return {
      base: productos, titulo: 'Catálogo', tituloLateral: 'Categorías', todos: 'Todos los productos',
      categorias: [
        ...[...CONFIG.CATEGORIAS_PRODUCTO, ...extras].map(c => ({ id: SV.slug(c), texto: c, prueba: p => p.seccion === 'PRODUCTO' && enCategoria(c)(p) })),
        { id: 'accesorios', texto: 'Accesorios', prueba: p => p.seccion === 'ACCESORIO' },
        { id: 'herramientas', texto: 'Herramientas', prueba: p => p.seccion === 'HERRAMIENTA' },
        { id: 'kits', texto: 'Kits', prueba: p => p.seccion === 'KIT' }
      ],
      variante: 'h', filtroMarcas: true, logosMarcas: true
    };
  }

  /* ---------- Estado de los filtros ---------- */
  const estado = {
    cat: SV.param('cat') || 'todos',
    marcas: SV.param('marca') ? SV.param('marca').split(',') : [],
    buscar: SV.param('buscar'),
    orden: SV.param('orden') || 'relevantes',
    vista: (() => { try { return localStorage.getItem('sv-vista') || 'grilla'; } catch (e) { return 'grilla'; } })()
  };

  function actualizarURL() {
    const q = new URLSearchParams();
    if (estado.cat !== 'todos') q.set('cat', estado.cat);
    if (estado.marcas.length) q.set('marca', estado.marcas.join(','));
    if (estado.buscar) q.set('buscar', estado.buscar);
    if (estado.orden !== 'relevantes') q.set('orden', estado.orden);
    const s = q.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }

  /* ---------- Render ---------- */
  let DEF, MARCAS = [];
  const $ = id => document.getElementById(id);

  function pintarLateral() {
    const items = [{ id: 'todos', texto: DEF.todos }, ...DEF.categorias];
    let html = `<div class="lateral__caja">
      <h2 class="lateral__titulo">${SV.esc(DEF.tituloLateral)}</h2>
      <ul class="lateral__lista">
        ${items.map(c => `<li><button type="button" class="lateral__item ${estado.cat === c.id ? 'activo' : ''}" data-cat="${c.id}">
          ${iconoPara(c.id === 'todos' ? 'todos' : c.texto)}<span>${SV.esc(c.texto)}</span></button></li>`).join('')}
      </ul>
    </div>`;

    if (DEF.filtroMarcas) {
      const nombres = [...new Set(DEF.base.map(p => p.marca))].filter(m => m && SV.marcaVisible(m))
        .sort((a, b) => {
          const ia = MARCAS.findIndex(m => m.nombre.toUpperCase() === a.toUpperCase());
          const ib = MARCAS.findIndex(m => m.nombre.toUpperCase() === b.toUpperCase());
          return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b);
        });
      if (nombres.length) {
        html += `<div class="lateral__caja">
          <h2 class="lateral__titulo">Marcas</h2>
          <ul class="lateral__lista lateral__lista--checks">
            ${nombres.map(m => `<li><label class="check">
              <input type="checkbox" value="${SV.esc(m)}" ${estado.marcas.some(x => x.toUpperCase() === m.toUpperCase()) ? 'checked' : ''}>
              <span>${SV.esc(m)}</span></label></li>`).join('')}
          </ul>
        </div>`;
      }
    }
    $('lateral').innerHTML = html;
  }

  function pintarLogos() {
    const el = $('logos-marcas');
    if (!el) return;
    if (!DEF.logosMarcas || !MARCAS.length) { el.hidden = true; return; }
    const conProductos = new Set(DEF.base.map(p => p.marca.toUpperCase()));
    const lista = MARCAS.filter(m => SV.marcaVisible(m.nombre) && conProductos.has(m.nombre.toUpperCase())).slice(0, 6);
    if (!lista.length) { el.hidden = true; return; }
    el.innerHTML = lista.map(m => `<button type="button" class="logos__item ${estado.marcas.some(x => x.toUpperCase() === m.nombre.toUpperCase()) ? 'activo' : ''}"
        data-marca="${SV.esc(m.nombre)}" aria-label="Filtrar por ${SV.esc(m.nombre)}">${SV.logoMarca(m, 'fondo-oscuro', 'logos__img')}</button>`).join('') +
      `<a href="marcas.html" class="logos__item logos__ver">Ver todas <span aria-hidden="true">›</span></a>`;
  }

  function filtrar() {
    const cat = DEF.categorias.find(c => c.id === estado.cat);
    const terminos = SV.normalizar(estado.buscar).split(/\s+/).filter(Boolean);
    let lista = DEF.base.filter(p =>
      (!cat || cat.prueba(p)) &&
      (!estado.marcas.length || estado.marcas.some(m => m.toUpperCase() === p.marca.toUpperCase())) &&
      terminos.every(t => SV.normalizar([p.nombre, p.marca, p.descripcion, p.categoria, p.presentacion, p.codigo, p.seccion].join(' ')).includes(t))
    );
    const ordenes = {
      relevantes: (a, b) => a.orden - b.orden,
      'precio-asc': (a, b) => a.precio - b.precio,
      'precio-desc': (a, b) => b.precio - a.precio,
      nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es')
    };
    lista = lista.slice().sort(ordenes[estado.orden] || ordenes.relevantes);
    // Los productos sin stock van al final
    return lista.sort((a, b) => (a.estado === 'SIN STOCK') - (b.estado === 'SIN STOCK'));
  }

  function pintarProductos() {
    const cat = DEF.categorias.find(c => c.id === estado.cat);
    const lista = filtrar();
    let titulo = cat ? cat.texto : DEF.todos;
    if (estado.buscar) titulo = `Resultados para "${estado.buscar}"`;
    $('titulo-listado').textContent = titulo;
    $('miga-actual').innerHTML = cat
      ? `<a href="?">${SV.esc(DEF.titulo)}</a><span class="miga__sep">›</span><span>${SV.esc(cat.texto)}</span>`
      : `<span>${SV.esc(DEF.titulo)}</span>`;
    $('cantidad-listado').textContent = `${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`;

    const grilla = $('grilla');
    grilla.className = `grilla grilla--${DEF.variante} ${estado.vista === 'lista' ? 'grilla--lista' : ''}`;
    if (!lista.length) {
      const filtrosActivos = estado.cat !== 'todos' || estado.marcas.length || estado.buscar;
      grilla.innerHTML = `<div class="mensaje-vacio">
        ${DEF.base.length === 0 && PAGINA === 'kits'
          ? 'Muy pronto vas a encontrar acá nuestros kits armados.<br>Mientras tanto, consultanos y te armamos uno a medida.'
          : 'No encontramos productos con esos filtros.'}
        <div class="mensaje-vacio__acciones">
          ${filtrosActivos ? '<button type="button" class="boton boton--borde" id="limpiar-filtros">Ver todo</button>' : ''}
          <a class="boton boton--agregar" target="_blank" rel="noopener"
             href="${SV.linkWhatsApp('¡Hola SV Detailing! Quería hacer una consulta.')}">Consultar por WhatsApp</a>
        </div>
      </div>`;
      return;
    }
    grilla.innerHTML = lista.map(p => SV.tarjetaHTML(p, estado.vista === 'lista' ? 'h' : DEF.variante)).join('');
  }

  function pintarTodo() {
    pintarLateral();
    pintarLogos();
    pintarProductos();
    document.querySelectorAll('.vista__btn').forEach(b => b.classList.toggle('activo', b.dataset.vista === estado.vista));
    $('orden').value = estado.orden;
    actualizarURL();
  }

  /* ---------- Eventos ---------- */
  function eventos() {
    $('lateral').addEventListener('click', e => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      estado.cat = b.dataset.cat;
      pintarTodo();
      if (window.innerWidth < 900) $('titulo-listado').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('lateral').addEventListener('change', e => {
      if (e.target.type !== 'checkbox') return;
      estado.marcas = [...$('lateral').querySelectorAll('.check input:checked')].map(i => i.value);
      pintarTodo();
    });
    $('logos-marcas').addEventListener('click', e => {
      const b = e.target.closest('[data-marca]');
      if (!b) return;
      const m = b.dataset.marca;
      const ya = estado.marcas.some(x => x.toUpperCase() === m.toUpperCase());
      estado.marcas = ya ? estado.marcas.filter(x => x.toUpperCase() !== m.toUpperCase()) : [...estado.marcas, m];
      pintarTodo();
    });
    $('orden').addEventListener('change', e => { estado.orden = e.target.value; pintarTodo(); });
    document.querySelectorAll('.vista__btn').forEach(b => b.addEventListener('click', () => {
      estado.vista = b.dataset.vista;
      try { localStorage.setItem('sv-vista', estado.vista); } catch (e) { /* sin almacenamiento */ }
      pintarTodo();
    }));
    document.addEventListener('click', e => {
      if (e.target.id !== 'limpiar-filtros') return;
      estado.cat = 'todos'; estado.marcas = []; estado.buscar = '';
      const campo = $('campo-buscar'); if (campo) campo.value = '';
      pintarTodo();
    });

    // Buscador del encabezado: filtra en vivo en el catálogo
    const campo = $('campo-buscar');
    if (campo && PAGINA === 'catalogo') {
      let t;
      campo.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => { estado.buscar = campo.value.trim(); pintarTodo(); }, 200);
      });
      campo.form.addEventListener('submit', e => { e.preventDefault(); estado.buscar = campo.value.trim(); pintarTodo(); });
    }
  }

  /* ---------- Arranque ---------- */
  SV.iniciar(PAGINA);
  SV.pintarBanner(PAGINA + '.webp', document.title);
  $('grilla').innerHTML = SV.cargandoHTML();

  SV.cargarDatos().then(({ productos, marcas }) => {
    MARCAS = marcas;
    DEF = definirPagina(productos);
    if (estado.cat !== 'todos' && !DEF.categorias.some(c => c.id === estado.cat)) {
      // Permite links como catalogo.html?cat=Pulido y Corrección
      const c = DEF.categorias.find(x => SV.normalizar(x.texto) === SV.normalizar(estado.cat) || x.id === SV.slug(estado.cat));
      estado.cat = c ? c.id : 'todos';
    }
    pintarTodo();
    eventos();
  }).catch(err => {
    console.error(err);
    $('grilla').innerHTML = SV.errorHTML();
  });
})();
