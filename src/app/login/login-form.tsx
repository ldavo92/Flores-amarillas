"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { iniciarSesion, registrarTaller, type AuthFormState } from "./actions";

const initialState: AuthFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Procesando..." : label}
    </button>
  );
}

export function LoginForm() {
  const [tab, setTab] = useState<"login" | "registro">("login");
  const [loginState, loginAction] = useFormState(iniciarSesion, initialState);
  const [registroState, registroAction] = useFormState(registrarTaller, initialState);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex rounded-card bg-white/10 p-1">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-card px-4 py-2 text-sm font-semibold transition ${
            tab === "login" ? "bg-white text-navy" : "text-white/70"
          }`}
          style={{ minHeight: "48px" }}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setTab("registro")}
          className={`flex-1 rounded-card px-4 py-2 text-sm font-semibold transition ${
            tab === "registro" ? "bg-white text-navy" : "text-white/70"
          }`}
          style={{ minHeight: "48px" }}
        >
          Crear taller
        </button>
      </div>

      {tab === "login" ? (
        <form action={loginAction} className="space-y-3">
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            required
            className="input-field"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            className="input-field"
          />
          {loginState?.error && (
            <p className="text-sm font-medium text-red-300">{loginState.error}</p>
          )}
          <SubmitButton label="Entrar" />
        </form>
      ) : (
        <form action={registroAction} className="space-y-3">
          <input
            name="nombreTaller"
            type="text"
            placeholder="Nombre del taller"
            required
            className="input-field"
          />
          <input
            name="telefonoWhatsapp"
            type="tel"
            placeholder="WhatsApp del taller (+52...)"
            required
            className="input-field"
          />
          <input
            name="nombreUsuario"
            type="text"
            placeholder="Tu nombre"
            className="input-field"
          />
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            required
            className="input-field"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            minLength={6}
            className="input-field"
          />
          {registroState?.error && (
            <p className="text-sm font-medium text-red-300">{registroState.error}</p>
          )}
          <SubmitButton label="Crear taller" />
        </form>
      )}
    </div>
  );
}
