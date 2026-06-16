import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Button from "./Button";
import { copyToClipboard } from "../utils/clipboard";

type Props = {
  label: string;
  url: string;
  showQr?: boolean;
};

export default function RoomLinkBox({ label, url, showQr = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!showQr) return;
    QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: "#020617", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [url, showQr]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
          />
          <Button size="md" variant="ghost" onClick={handleCopy}>
            {copied ? "✓ Copiado" : "Copiar"}
          </Button>
        </div>
      </div>
      {showQr && qr && (
        <div className="flex justify-center">
          <img src={qr} alt="QR de la pantalla pública" className="rounded-xl" />
        </div>
      )}
    </div>
  );
}
