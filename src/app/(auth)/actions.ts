"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/types";

export type AuthState = { erro?: string };

/** Login com e-mail e senha */
export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("not confirmed")) {
      return {
        erro: "Seu e-mail ainda não foi confirmado. Confirme pelo link enviado ou peça para desativar a confirmação de e-mail.",
      };
    }
    return { erro: "E-mail ou senha incorretos." };
  }

  await redirectByRole(supabase);
  return {};
}

/** Cadastro de novo usuário (síndico ou empresa) */
export async function cadastrar(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const role = String(formData.get("role") ?? "sindico") as UserRole;

  if (nome.length < 2) return { erro: "Informe seu nome." };
  if (senha.length < 6) return { erro: "A senha deve ter ao menos 6 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, role } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already"))
      return { erro: "Este e-mail já está cadastrado. Faça login." };
    return { erro: "Não foi possível criar a conta. Tente novamente." };
  }

  // Empresa vai direto pro cadastro complementar (CNPJ, segmento etc.)
  if (role === "empresa") {
    redirect("/empresa/cadastro");
  }
  redirect("/");
}

/** Logout */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Redireciona para a área certa conforme o papel do usuário */
async function redirectByRole(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role === "empresa") redirect("/empresa");
  if (profile?.role === "admin") redirect("/admin");
  redirect("/");
}
