import { CotizadorClient } from "./cotizador-client";

export default function CotizadorPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-navy">Cotizador rápido de refacciones</h1>
      <CotizadorClient />
    </div>
  );
}
