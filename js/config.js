/* =========================================================
   SV DETAILING — CONFIGURACIÓN GENERAL
   Este es el único archivo que necesitás tocar para cambiar
   datos del negocio o conectar el Google Sheet.
   ========================================================= */

const CONFIG = {

  /* ---------- GOOGLE SHEET ----------
     Pegá acá los links de "Publicar en la web" (formato CSV)
     de las hojas CATALOGO y MARCAS.
     Mientras estén vacíos, la página usa los productos de
     ejemplo de js/datos-ejemplo.js                           */
  URL_CATALOGO: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLKTASW_ijL6PcFNIRgNad4kEtMDwJeEnlpLl9ieuLEAQ7E8rujcX_wQmetwBzBI9mrydUuLGoHK0t/pub?gid=0&single=true&output=csv',
  URL_MARCAS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLKTASW_ijL6PcFNIRgNad4kEtMDwJeEnlpLl9ieuLEAQ7E8rujcX_wQmetwBzBI9mrydUuLGoHK0t/pub?gid=471321479&single=true&output=csv',

  // Minutos que la página guarda los datos antes de volver a pedirlos al Sheet
  MINUTOS_CACHE: 5,

  /* ---------- NEGOCIO ---------- */
  WHATSAPP: '5493804269263',          // Formato internacional, sin + ni espacios
  WHATSAPP_TEXTO: '3804-269263',      // Como se muestra en el pie de página
  DIRECCION: 'Av. Adolfo E. Dávila 245',
  CIUDAD: 'Capital - La Rioja.',
  FACEBOOK_TEXTO: 'SvDetailing Autosv',
  FACEBOOK_URL: '',                    // Pegá el link de la página de Facebook
  INSTAGRAM_TEXTO: '@svdetailing.lr',
  INSTAGRAM_URL: 'https://www.instagram.com/svdetailing.lr/',
  TEXTO_PIE: 'Productos profesionales de car detailing para el cuidado, limpieza y protección de tu vehículo.',

  /* ---------- CATEGORÍAS (orden en que aparecen) ----------
     Tienen que coincidir con la hoja LISTAS del Sheet.        */
  CATEGORIAS_PRODUCTO: [
    'Limpieza Exterior',
    'Limpieza Interior',
    'Pulido y Corrección',
    'Protección y Sellado'
  ],
  CATEGORIAS_ACCESORIO: [
    'Pads y Boinas',
    'Microfibras',
    'Aplicadores',
    'Cepillos y Brochas',
    'Pulverizadores',
    'Cañones de espuma',
    'Baldes y Separadores',
    'Herramientas',              // agrupa todo lo que tenga SECCION = HERRAMIENTA
    'Maletines y Bolsos'
  ],
  CATEGORIAS_KIT: [
    'Kit Lavado',
    'Kit Pulido y Corrección',
    'Kit Protección',
    'Kit Interior',
    'Kit Exterior',
    'Kit Mantenimiento'
  ],

  // Marcas que NO se muestran en filtros ni en la página Marcas
  MARCAS_OCULTAS: ['GENERICO']
};
