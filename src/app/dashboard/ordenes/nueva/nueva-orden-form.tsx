"use client";

import { useFormState, useFormStatus } from "react-dom";
import { crearOrden, type CrearOrdenState } from "@/app/dashboard/actions";

const initialState: CrearOrdenState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Guardando..." : "Crear orden"}
    </button>
  );
}

export function NuevaOrdenForm() {
  const [state, formAction] = useFormState(crearOrden, initialState);

  return (
    <form action={formAction} className="card max-w-lg space-y-3">
      <div>
        <label className="mb-1 block text-sm font-semibold text-navy">Nombre del cliente *</label>
        <input name="nombreCliente" required className="input-field" placeholder="Ej. Juan Pérez" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-navy">WhatsApp del cliente *</label>
        <input name="telefono" required className="input-field" placeholder="+52 55 1234 5678" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Marca *</label>
          <input name="marca" required className="input-field" placeholder="Nissan" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Modelo *</label>
          <input name="modelo" required className="input-field" placeholder="Versa" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Año</label>
          <input name="anio" type="number" className="input-field" placeholder="2018" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Placas</label>
          <input name="placas" className="input-field" placeholder="ABC-123-A" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-navy">Descripción de la falla *</label>
        <textarea
          name="descripcion"
          required
          rows={3}
          className="input-field !h-auto py-3"
          placeholder="Ej. Se ahoga en bajas revoluciones, ruido al frenar..."
        />
      </div>
      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
