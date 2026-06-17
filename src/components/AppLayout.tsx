import type { ReactNode } from "react";
import type { ConnectionStatus } from "../types/game";

type Props = {
  children: ReactNode;
  connection?: ConnectionStatus;
  className?: string;
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: "Conectando…",
  connected: "En línea",
  disconnected: "Sin conexión",
};

const STATUS_DOT: Record<ConnectionStatus, string> = {
  connecting: "bg-amber-400",
  connected: "bg-emerald-400",
  disconnected: "bg-red-500",
};

export function ConnectionPill({ connection }: { connection: ConnectionStatus }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[connection]}`} />
      {STATUS_LABEL[connection]}
    </span>
  );
}

export default function AppLayout({ children, className = "" }: Props) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-950 to-zinc-950 text-white ${className}`}>
      {children}
    </div>
  );
}
