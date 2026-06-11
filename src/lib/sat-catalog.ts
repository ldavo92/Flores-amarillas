/**
 * Catálogo SAT (CFDI 4.0) precargado para el giro de talleres mecánicos.
 * Referencia: catálogo c_ClaveProdServ / c_ClaveUnidad del SAT.
 */

export const CLAVES_PRODUCTO_SERVICIO = {
  /** Reparación y mantenimiento automotor y de camiones ligeros (default) */
  REPARACION_MANTENIMIENTO: "78181507",
  /** Servicios de panel y pintura / Servicio de taller mecánico */
  PANEL_PINTURA: "78181600",
} as const;

export const CLAVE_PRODUCTO_SERVICIO_DEFAULT = CLAVES_PRODUCTO_SERVICIO.REPARACION_MANTENIMIENTO;

/** Clave de Unidad de Medida SAT para mano de obra / servicios de diagnóstico */
export const CLAVE_UNIDAD_SERVICIO = "E48";
export const UNIDAD_SERVICIO_TEXTO = "Unidad de servicio";

/** Usos de CFDI más comunes para clientes de un taller mecánico */
export const USOS_CFDI = {
  GASTOS_EN_GENERAL: "G03",
  POR_DEFINIR: "S01",
  PAGOS: "CP01",
} as const;

export const USO_CFDI_DEFAULT = USOS_CFDI.GASTOS_EN_GENERAL;

/** Métodos y formas de pago habituales */
export const METODO_PAGO_DEFAULT = "PUE"; // Pago en una sola exhibición
export const FORMA_PAGO_DEFAULT = "01"; // Efectivo (ajustar según el caso real)

export const CFDI_TYPE_INGRESO = "I";
export const EXPORTACION_NO_APLICA = "01";
