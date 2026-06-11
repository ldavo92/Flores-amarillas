import {
  CFDI_TYPE_INGRESO,
  EXPORTACION_NO_APLICA,
  CLAVE_UNIDAD_SERVICIO,
  UNIDAD_SERVICIO_TEXTO,
  METODO_PAGO_DEFAULT,
  FORMA_PAGO_DEFAULT,
  USO_CFDI_DEFAULT,
  CLAVE_PRODUCTO_SERVICIO_DEFAULT,
} from "./sat-catalog";

export interface FacturaItemInput {
  /** "Mano de Obra" o "Refacciones" (descripción del concepto) */
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  /** Clave de producto/servicio SAT (default: reparación y mantenimiento automotor) */
  claveProdServ?: string;
  /** IVA en decimal, ej. 0.16 */
  tasaIva?: number;
}

export interface FacturaTallerInput {
  rfc: string;
  nombre: string;
  regimenFiscal: string;
  codigoPostal: string;
}

export interface FacturaClienteInput {
  rfc: string;
  nombre: string;
  email?: string;
  usoCfdi?: string;
  regimenFiscalReceptor: string;
  codigoPostal: string;
}

export interface FacturamaCfdiPayload {
  CfdiType: string;
  Exportation: string;
  PaymentForm: string;
  PaymentMethod: string;
  ExpeditionPlace: string;
  Issuer: {
    Rfc: string;
    Name: string;
    FiscalRegime: string;
  };
  Receiver: {
    Rfc: string;
    Name: string;
    CfdiUse: string;
    FiscalRegime: string;
    TaxZipCode: string;
    Email?: string;
  };
  Items: {
    ProductCode: string;
    Description: string;
    UnitCode: string;
    Unit: string;
    Quantity: number;
    UnitPrice: number;
    Subtotal: number;
    Total: number;
    TaxObject: string;
    Taxes: { Total: number; Name: string; Rate: number; IsRetention: boolean }[];
  }[];
}

/**
 * Construye el payload CFDI 4.0 para Facturama, separando "Mano de Obra"
 * y "Refacciones" como conceptos distintos (transparencia para el consumidor).
 */
export function construirPayloadCfdi(
  taller: FacturaTallerInput,
  cliente: FacturaClienteInput,
  items: FacturaItemInput[]
): FacturamaCfdiPayload {
  return {
    CfdiType: CFDI_TYPE_INGRESO,
    Exportation: EXPORTACION_NO_APLICA,
    PaymentForm: FORMA_PAGO_DEFAULT,
    PaymentMethod: METODO_PAGO_DEFAULT,
    ExpeditionPlace: taller.codigoPostal,
    Issuer: {
      Rfc: taller.rfc,
      Name: taller.nombre,
      FiscalRegime: taller.regimenFiscal,
    },
    Receiver: {
      Rfc: cliente.rfc,
      Name: cliente.nombre,
      CfdiUse: cliente.usoCfdi || USO_CFDI_DEFAULT,
      FiscalRegime: cliente.regimenFiscalReceptor,
      TaxZipCode: cliente.codigoPostal,
      Email: cliente.email,
    },
    Items: items.map((item) => {
      const tasaIva = item.tasaIva ?? 0.16;
      const subtotal = round2(item.cantidad * item.precioUnitario);
      const iva = round2(subtotal * tasaIva);
      return {
        ProductCode: item.claveProdServ || CLAVE_PRODUCTO_SERVICIO_DEFAULT,
        Description: item.descripcion,
        UnitCode: CLAVE_UNIDAD_SERVICIO,
        Unit: UNIDAD_SERVICIO_TEXTO,
        Quantity: item.cantidad,
        UnitPrice: item.precioUnitario,
        Subtotal: subtotal,
        Total: round2(subtotal + iva),
        TaxObject: "02", // Sí objeto de impuesto
        Taxes: [
          {
            Total: iva,
            Name: "IVA",
            Rate: tasaIva,
            IsRetention: false,
          },
        ],
      };
    }),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface FacturamaResult {
  Id: string;
  Folio?: string;
  Serie?: string;
  Complement?: { TaxStamp?: { Uuid?: string } };
}

/**
 * Timbra el CFDI usando la API REST de Facturama (autenticación básica
 * con FACTURAMA_USER / FACTURAMA_PASSWORD).
 */
export async function timbrarCfdi(payload: FacturamaCfdiPayload): Promise<FacturamaResult> {
  const baseUrl = process.env.FACTURAMA_API_URL || "https://apisandbox.facturama.mx";
  const user = process.env.FACTURAMA_USER!;
  const password = process.env.FACTURAMA_PASSWORD!;
  const auth = Buffer.from(`${user}:${password}`).toString("base64");

  const response = await fetch(`${baseUrl}/api/3/cfdis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error de Facturama (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as FacturamaResult;
}

/** Obtiene el PDF/XML de un CFDI ya timbrado */
export function urlsCfdi(facturamaId: string) {
  const baseUrl = process.env.FACTURAMA_API_URL || "https://apisandbox.facturama.mx";
  return {
    pdf: `${baseUrl}/api/cfdi/pdf/issued/${facturamaId}`,
    xml: `${baseUrl}/api/cfdi/xml/issued/${facturamaId}`,
  };
}
