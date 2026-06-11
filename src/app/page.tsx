import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center text-white">
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        Taller<span className="text-accent">SaaS</span>
      </h1>
      <p className="mt-4 max-w-md text-white/70">
        Tu taller, controlado por WhatsApp. Recepción, diagnóstico con IA,
        cotización de refacciones y facturación CFDI 4.0 en un solo lugar.
      </p>
      <Link href="/login" className="btn-primary mt-8 w-full max-w-xs">
        Entrar al panel
      </Link>
    </main>
  );
}
