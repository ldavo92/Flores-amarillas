import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cerrarSesion } from "@/app/login/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, rol, talleres ( nombre )")
    .eq("id", user.id)
    .single();

  const tallerNombre = (perfil?.talleres as unknown as { nombre: string } | null)?.nombre;

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="sticky top-0 z-20 bg-navy text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="text-lg font-extrabold">
            Taller<span className="text-accent">SaaS</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="rounded-card px-3 py-2 font-semibold hover:bg-white/10">
              Tablero
            </Link>
            <Link href="/dashboard/manuales" className="rounded-card px-3 py-2 font-semibold hover:bg-white/10">
              Manuales
            </Link>
            <Link href="/dashboard/cotizador" className="rounded-card px-3 py-2 font-semibold hover:bg-white/10">
              Refacciones
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white/70 sm:inline">{tallerNombre}</span>
            <form action={cerrarSesion}>
              <button type="submit" className="rounded-card border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-2 py-4 sm:px-4">{children}</main>
    </div>
  );
}
