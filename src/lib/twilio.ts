import twilio from "twilio";

let _client: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (!_client) {
    _client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return _client;
}

/** Envía un mensaje de WhatsApp saliente vía Twilio */
export async function enviarWhatsApp(to: string, body: string) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_NUMBER!;
  const toAddr = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  return client.messages.create({
    from,
    to: toAddr,
    body,
  });
}

/**
 * Las URLs de medios (fotos/audios) que envía Twilio requieren autenticación
 * con Account SID + Auth Token. Hay que descargarlas en el servidor antes
 * de mandarlas a OpenAI.
 */
export async function descargarMediaTwilio(mediaUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const response = await fetch(mediaUrl, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    throw new Error(`No se pudo descargar el media de Twilio: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType };
}

/**
 * Valida que la petición al webhook venga realmente de Twilio,
 * usando la firma X-Twilio-Signature.
 */
export function validarFirmaTwilio(
  signature: string | null,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken || !signature) return false;
  return twilio.validateRequest(authToken, signature, url, params);
}
