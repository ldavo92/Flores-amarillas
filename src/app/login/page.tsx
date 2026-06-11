import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 py-12 text-white">
      <h1 className="mb-1 text-2xl font-extrabold">
        Taller<span className="text-accent">SaaS</span>
      </h1>
      <p className="mb-8 text-sm text-white/60">Panel de gestión para talleres mecánicos</p>
      <LoginForm />
    </main>
  );
}
