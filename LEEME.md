# SV Detailing — Catálogo web

Página estática (HTML + CSS + JavaScript) que lee los productos de un Google Sheet y cierra los pedidos por WhatsApp.

## Páginas
| Archivo | Página |
|---|---|
| `index.html` | Inicio: banner, marcas y productos destacados |
| `catalogo.html` | Todos los productos, con filtros por categoría y marca |
| `marcas.html` | Tarjetas de marcas (llevan al catálogo filtrado) |
| `kits.html` | Productos con SECCION = KIT |
| `accesorios.html` | Productos con SECCION = ACCESORIO o HERRAMIENTA |
| `carrito.html` | Carrito y envío del pedido por WhatsApp |

## Archivos de código
- `css/estilos.css`: todos los estilos (colores en `:root`, arriba de todo).
- `js/config.js`: **datos del negocio y links del Sheet.** Es el único archivo que hace falta tocar.
- `js/datos-ejemplo.js`: productos de ejemplo, se usan mientras no esté conectado el Sheet.
- `js/tienda.js`: lectura del Sheet, carrito, encabezado, pie y tarjetas.
- `js/listado.js`, `js/inicio.js`, `js/marcas.js`, `js/carrito.js`: lógica de cada página.

## Conectar el Google Sheet
1. En el Sheet: **Archivo → Compartir → Publicar en la web**.
2. Elegí la hoja **CATALOGO** y el formato **Valores separados por comas (.csv)** → Publicar → copiá el link.
3. Repetí con la hoja **MARCAS**.
4. Pegá cada link en `js/config.js` (`URL_CATALOGO` y `URL_MARCAS`).
5. Dejá el Sheet con acceso **Restringido** (no "cualquier persona con el enlace"); así solo se ven las hojas publicadas y no STOCK.

Los cambios del Sheet tardan unos minutos en verse (Google y la página guardan una copia por 5 minutos).

## Imágenes
- Productos: `img/productos/` con el nombre de la columna FOTO. Si en el Sheet dice `.webp` y el archivo es `.png` (o al revés), igual lo encuentra.
- Logos de marcas: `img/marcas/fondo-oscuro/` y `img/marcas/fondo-claro/`, con el nombre de la columna LOGO. Si una marca no tiene logo, se muestra su nombre.
- Banners: `img/banners/<pagina>.webp` (1920 × 640).
- Nombres siempre en minúscula, sin espacios ni acentos.

## Probar en la PC
Abrí `index.html` con la extensión **Live Server** de VS Code (clic derecho → *Open with Live Server*).

## Kits y combos

- Un kit es una fila de CATALOGO con `SECCION = KIT`.
- Si la columna **P (INCLUYE)** tiene contenido, al tocar la tarjeta se abre la vista de detalle con un carrusel.
  - Primera foto: la del combo.
  - Después, una foto por cada producto que incluye.
- Formato de INCLUYE: códigos del catálogo separados por `;`, por ejemplo `TS 6792031 DF; TS 8853691 MG`.
  - Para más de una unidad: `2x CODIGO`.
  - Algo que no está en el catálogo se escribe como texto, por ejemplo `Aplicador de Espuma Alta Densidad`. Su foto se busca como `img/productos/aplicador-de-espuma-alta-densidad.webp`.
- El stock del kit sale de sus productos: si alguno está SIN STOCK, el kit también.
- Link directo a un combo: `catalogo.html?kit=CODIGO`.

## Etiqueta por marca (ej: 5% OFF en efectivo)

- Se configura en `js/config.js`, en `ETIQUETA_MARCAS`. Ahí están la imagen y la lista de marcas que la muestran sobre la foto.
- Para sacarla, dejá la lista vacía: `marcas: []`. Para cambiarla, reemplazá la imagen en `img/etiquetas/`.
