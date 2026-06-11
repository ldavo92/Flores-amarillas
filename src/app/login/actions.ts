"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthFormState {
  error?: string;
}

export async function iniciarSesion(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function registrarTaller(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const nombreTaller = String(formData.get("nombreTaller") || "");
  const telefonoWhatsapp = String(formData.get("telefonoWhatsapp") || "");
  const nombreUsuario = String(formData.get("nombreUsuario") || "");

  if (!email || !password || !nombreTaller || !telefonoWhatsapp) {
    return { error: "Todos los campos son obligatorios." };
  }

  const supabase = createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !signUpData.user) {
    return { error: signUpError?.message || "No se pudo crear la cuenta." };
  }

  // Crear el tenant (taller) y el perfil del usuario admin con permisos elevados.
  const admin = createAdminClient();

  const { data: taller, error: tallerError } = await admin
    .from("talleres")
    .insert({ nombre: nombreTaller, telefono_whatsapp: telefonoWhatsapp })
    .select("id")
    .single();

  if (tallerError || !taller) {
    return { error: `No se pudo crear el taller: ${tallerError?.message}` };
  }

  const { error: perfilError } = await admin.from("perfiles").insert({
    id: signUpData.user.id,
    taller_id: taller.id,
    nombre: nombreUsuario || null,
    rol: "admin",
  });

  if (perfilError) {
    return { error: `No se pudo crear el perfil: ${perfilError.message}` };
  }

  if (!signUpData.session) {
    return {
      error:
        "Cuenta creada. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function cerrarSesion() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
