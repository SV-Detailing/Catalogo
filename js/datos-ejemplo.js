/* =========================================================
   DATOS DE EJEMPLO
   Se usan SOLO mientras CONFIG.URL_CATALOGO / URL_MARCAS
   estén vacíos. Es una copia de lo que cargamos en el Sheet.
   ========================================================= */

const EJEMPLO_CATALOGO = `CODIGO,VISIBLE,SECCION,CATEGORIA,MARCA,NOMBRE,DESCRIPCION,PRESENTACION,PRECIO,PRECIO_PROMO,ESTADO,DESTACADO,FOTO,ORDEN
3DCEPCORTOAZUL,SI,ACCESORIO,Cepillos y Brochas,3D,Cepillo Pasarruedas,"Mango corto, cerda dura",1 unidad,8400,,ÚLTIMAS UNIDADES,NO,3dcepcortoazul.webp,1
502OZ08,SI,PRODUCTO,Pulido y Corrección,3D,AAT 502 Paso 2,Compuesto pulidor de abrillantado,236ml,25550,,ÚLTIMAS UNIDADES,NO,502oz08.webp,2
501OZ08,SI,PRODUCTO,Pulido y Corrección,3D,AAT 501 Paso 1,Compuesto pulidor de corte,236ml,22950,,ÚLTIMAS UNIDADES,NO,501oz08.webp,3
3DDISCO1500,SI,ACCESORIO,Pads y Boinas,3D,Disco de Lija HDQ 1500,"Tela abrojo, en seco",1 unidad,2650,,ÚLTIMAS UNIDADES,NO,3ddisco1500.webp,4
3DDISCO2000,SI,ACCESORIO,Pads y Boinas,3D,Disco de Lija HDQ 2000,"Tela abrojo, en seco",1 unidad,2650,,ÚLTIMAS UNIDADES,NO,3ddisco2000.webp,5
3DDISCO3000,SI,ACCESORIO,Pads y Boinas,3D,Disco de Lija HDQ 3000,"Tela abrojo, en seco",1 unidad,2650,,ÚLTIMAS UNIDADES,NO,3ddisco3000.webp,6
GLWWASH,SI,PRODUCTO,Limpieza Exterior,3D,GLW Ceramic Wash,Shampoo pH neutro cerámico SiO2,473ml,24200,,ÚLTIMAS UNIDADES,SI,glwwash.webp,7
GLWULTIMATEWASH,SI,PRODUCTO,Limpieza Exterior,3D,GLW Ultimate Wash,Shampoo súper espuma para foam lance,473ml,21300,,ÚLTIMAS UNIDADES,NO,glwultimatewash.webp,8
3DGRAND,SI,PRODUCTO,Limpieza Exterior,3D,Grand Slam,Desengrasante limpia motores,473ml,15100,,ÚLTIMAS UNIDADES,NO,3dgrand.webp,9
3DICUT,SI,PRODUCTO,Pulido y Corrección,3D,I-Cut,Pulimento pulidor de un solo paso,473ml,54100,,ÚLTIMAS UNIDADES,SI,3dicut.webp,10
3DONE500,SI,PRODUCTO,Pulido y Corrección,3D,One Hybrid,Pulidor adaptativo corte alto y fino,473ml,54750,,ÚLTIMAS UNIDADES,SI,3done500.webp,11
3DPADSPIDER5AMA,SI,ACCESORIO,Pads y Boinas,3D,Pad Spider Amarillo,"Corte alto, roto orbital",5 pulgadas,11850,,ÚLTIMAS UNIDADES,NO,3dpadspider5ama.webp,12
3DPADSPIDERNEGRO5,SI,ACCESORIO,Pads y Boinas,3D,Pad Spider Negro,"Corte fino, roto orbital",5 pulgadas,11850,,ÚLTIMAS UNIDADES,NO,3dpadspidernegro5.webp,13
3DPINK5,SI,PRODUCTO,Limpieza Exterior,3D,Pink Car Soap,Shampoo lava autos pH neutro,473ml,14800,,ÚLTIMAS UNIDADES,SI,3dpink5.webp,14
202OZ08,SI,PRODUCTO,Limpieza Exterior,3D,Pink Car Soap Concentrado,Shampoo lava autos pH neutro,236ml,8850,,ÚLTIMAS UNIDADES,NO,202oz08.webp,15
3DTRIMCARE,SI,PRODUCTO,Protección y Sellado,3D,Trim Care,Restaurador de plásticos y molduras,473ml,47200,,ÚLTIMAS UNIDADES,SI,3dtrimcare.webp,16
3DTIRE,SI,PRODUCTO,Protección y Sellado,3D,Tire Shine,Embellecedor de plásticos,473ml,20500,,ÚLTIMAS UNIDADES,NO,3dtire.webp,17
3DHANDPOLISH,SI,PRODUCTO,Pulido y Corrección,3D,Ultimate Hand Polish,Pulidor abrillantador quita rayas,473ml,35300,,ÚLTIMAS UNIDADES,SI,3dhandpolish.webp,18
3DHAND250ML,SI,PRODUCTO,Pulido y Corrección,3D,Ultimate Hand Polish,Pulimento para uso manual,236ml,20500,,ÚLTIMAS UNIDADES,NO,3dhand250ml.webp,19
3DYELBIDON,SI,PRODUCTO,Limpieza Exterior,3D,Yellow Degreaser,Desengrasante exterior para llantas,"3,78L",33400,,ÚLTIMAS UNIDADES,NO,3dyelbidon.webp,20
3DYEL5,SI,PRODUCTO,Limpieza Exterior,3D,Yellow Degreaser,Desengrasante para llantas,473ml,11200,,ÚLTIMAS UNIDADES,NO,3dyel5.webp,21
520OZ08,SI,PRODUCTO,Pulido y Corrección,3D,ACA 520 Finish,Abrillantador pulidor de terminación,236ml,30300,,ÚLTIMAS UNIDADES,NO,520oz08.webp,22
ACOPLE-M22-GIRATORIO,SI,HERRAMIENTA,Hidrolavadoras,GENERICO,Acople Rápido Giratorio M22,360° para hidrolavadora,1 unidad,10350,,ÚLTIMAS UNIDADES,NO,acople-m22-giratorio.webp,23
T-01A,SI,HERRAMIENTA,Hidrolavadoras,GENERICO,Acople Rápido,"Para hidrolavadora, conexión de manguera",1 unidad,13150,,ÚLTIMAS UNIDADES,NO,t-01a.webp,24
ACOPLE-ANNOVI,SI,HERRAMIENTA,Hidrolavadoras,GENERICO,Adaptador Foam Lance Annovi,Rosca macho M14 - M22,1 unidad,9600,,ÚLTIMAS UNIDADES,NO,acople-annovi.webp,25
ADAPT-M22AM14,SI,HERRAMIENTA,Hidrolavadoras,GENERICO,Adaptador Rosca M22 a M14,Hembra M22 / macho M14 para pistola corta,1 unidad,6900,,ÚLTIMAS UNIDADES,NO,adapt-m22am14.webp,26
ADAPTAL,SI,HERRAMIENTA,Pulidoras,GENERICO,Adaptador M14 a Taladro,Para backing plate,1 unidad,4200,,ÚLTIMAS UNIDADES,NO,adaptal.webp,27
CALPLOT-PULVE-EXTRA,SI,ACCESORIO,Pulverizadores,CALPLOT,Pulverizador Premium,"Boquilla extra potente, verde",2L,11200,,ÚLTIMAS UNIDADES,NO,calplot-pulve-extra.webp,28
CALPLOTGATILLO1LT,SI,ACCESORIO,Pulverizadores,CALPLOT,Pulverizador Gatillo Profesional,Envase 360°,1L,5750,,ÚLTIMAS UNIDADES,NO,calplotgatillo1lt.webp,29`;

const EJEMPLO_MARCAS = `MARCA,LOGO,DESCRIPCION,ORDEN,VISIBLE
VONIXX,vonixx.svg,Innovación y alto rendimiento en cuidado automotriz.,1,SI
MENZERNA,menzerna.svg,Compuestos y pulidores de alta gama.,2,SI
VINTEX,vintex.svg,Productos de limpieza y cuidado para tu vehículo.,3,SI
TOXIC SHINE,toxic-shine.svg,Productos profesionales para un resultado extremo.,4,SI
K78,k78.svg,Productos especializados en limpieza y protección.,5,SI
LAFFITTE,laffitte.svg,Soluciones premium para tu vehículo.,6,SI
3D,3d.svg,Calidad y tecnología para un detailing superior.,7,SI
CALPLOT,calplot.svg,Pulverizadores y accesorios profesionales.,8,SI`;
