import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  title?: string;
};

export default function Card({ children, className = "", title }: Props) {
  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur ${className}`}
    >
      {title && (
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
