import { toPng } from "html-to-image";

/** Renderiza un nodo DOM a PNG. Devuelve un dataURL. */
export async function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    // Fondo del estadio por si el nodo es transparente
    backgroundColor: "#0a0f1f",
  });
}

/** Descarga un dataURL como archivo. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Comparte una imagen vía Web Share API (con archivo) o cae a descarga. */
export async function shareImage(
  dataUrl: string,
  filename: string,
  text: string,
): Promise<"shared" | "downloaded"> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text, title: "MundialGo" });
      return "shared";
    }
  } catch {
    /* fall through to download */
  }
  downloadDataUrl(dataUrl, filename);
  return "downloaded";
}
