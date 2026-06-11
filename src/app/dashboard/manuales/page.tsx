import { ManualesClient } from "./manuales-client";

export default function ManualesPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-navy">Manuales y copiloto RAG</h1>
      <ManualesClient />
    </div>
  );
}
