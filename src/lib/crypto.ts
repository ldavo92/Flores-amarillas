import crypto from "crypto";

/**
 * Cifrado de datos personales (teléfonos, placas) para cumplir LFPDPPP.
 * Usa AES-256-GCM con una clave maestra en DATA_ENCRYPTION_KEY (base64, 32 bytes).
 * Formato almacenado: "<iv_base64>:<authTag_base64>:<ciphertext_base64>"
 */

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.DATA_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("DATA_ENCRYPTION_KEY no está configurada");
  }
  const buf = Buffer.from(key, "base64");
  if (buf.length !== 32) {
    throw new Error("DATA_ENCRYPTION_KEY debe ser 32 bytes en base64 (openssl rand -base64 32)");
  }
  return buf;
}

export function encryptField(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptField(ciphertext: string): string {
  const [ivB64, authTagB64, dataB64] = ciphertext.split(":");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Formato de campo cifrado inválido");
  }
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const data = Buffer.from(dataB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Hash determinístico (HMAC-SHA256) para poder buscar/indexar
 * un valor cifrado (p. ej. localizar un cliente por teléfono)
 * sin exponer el dato en texto plano.
 */
export function hashField(value: string): string {
  return crypto.createHmac("sha256", getKey()).update(value).digest("hex");
}

/** Normaliza un número de WhatsApp ("whatsapp:+52..." -> "+52...") */
export function normalizePhone(rawPhone: string): string {
  return rawPhone.replace(/^whatsapp:/, "").trim();
}

/** Igual que decryptField pero no lanza error (devuelve null si falla) */
export function decryptFieldSafe(ciphertext: string | null): string | null {
  if (!ciphertext) return null;
  try {
    return decryptField(ciphertext);
  } catch {
    return null;
  }
}
