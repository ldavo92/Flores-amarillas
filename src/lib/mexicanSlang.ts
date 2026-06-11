/**
 * Diccionario de argot mecánico mexicano -> término técnico estándar.
 * Se inyecta en el system prompt del bot recepcionista para que el LLM
 * "traduzca" correctamente lo que dicen los clientes.
 */
export const ARGOT_MECANICO_MX: Record<string, string> = {
  licuadora: "bomba de la dirección hidráulica",
  cacahuate: "tornillo/birlo estabilizador (link de barra estabilizadora)",
  "mariposa": "cuerpo de aceleración (TBI / throttle body)",
  "charola": "brazo de suspensión (control arm)",
  "balero": "rodamiento (bearing)",
  "bobina": "bobina de encendido (ignition coil)",
  "cremallera": "cremallera de dirección (steering rack)",
  "matraca": "trinquete / catarina, según contexto",
  "polea loca": "polea tensora",
  "tripoide": "junta homocinética (CV joint)",
  "rondana": "arandela (washer)",
  "birlo": "tornillo de rueda (lug nut)",
  "balatas": "pastillas de freno (brake pads)",
  "clutch": "embrague",
  "bayoneta": "varilla medidora de aceite (dipstick)",
  "marcha": "motor de arranque (starter motor)",
  "transmisión": "caja de velocidades (gearbox/transmission)",
  "anticongelante": "refrigerante del motor (coolant)",
  "checar": "revisar / diagnosticar",
  "se ahoga": "el motor pierde potencia o se apaga (posible falla de combustible/encendido)",
  "jalar parejo": "el motor funciona sin fallos de combustión (sin cilindros muertos)",
  "se pandeó": "se deformó (p. ej. el disco de freno o la cabeza del motor)",
  "ponchada": "llanta pinchada/desinflada",
  "fuga": "fuga de fluido (aceite, refrigerante, etc.)",
  "rin": "rueda/llanta de aluminio o acero",
  "vela": "bujía (spark plug)",
  "amortiguador": "amortiguador (shock absorber)",
  "cremallera de la dirección": "steering rack",
};

export function buildArgotPromptSnippet(): string {
  const entries = Object.entries(ARGOT_MECANICO_MX)
    .map(([coloquial, tecnico]) => `- "${coloquial}" -> ${tecnico}`)
    .join("\n");

  return `Diccionario de argot mecánico usado por clientes mexicanos. Úsalo para interpretar correctamente la falla descrita y, si aplica, menciona el término técnico al mecánico:\n${entries}`;
}
