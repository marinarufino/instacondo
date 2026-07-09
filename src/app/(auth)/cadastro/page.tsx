"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Building2, UserRound } from "lucide-react";
import { cadastrar } from "../actions";
import { ConnexaMark } from "@/components/ConnexaLogo";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import type { UserRole } from "@/lib/types";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(cadastrar, {});
  const [role, setRole] = useState<UserRole>("sindico");

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <ConnexaMark size={56} />
        <h1 className="mt-3 text-2xl font-extrabold text-dark">Criar conta</h1>
        <p className="mt-1 text-sm text-muted">
          Comece a se conectar em poucos cliques.
        </p>
      </div>

      {/* Seletor de perfil */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <RoleCard
          active={role === "sindico"}
          onClick={() => setRole("sindico")}
          icon={<UserRound size={22} />}
          titulo="Sou Síndico"
          desc="Busco empresas"
        />
        <RoleCard
          active={role === "empresa"}
          onClick={() => setRole("empresa")}
          icon={<Building2 size={22} />}
          titulo="Sou Empresa"
          desc="Quero ser vista"
        />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="role" value={role} />

        <Field label={role === "empresa" ? "Nome do responsável" : "Seu nome"}>
          <Input name="nome" required placeholder="Nome completo" />
        </Field>
        <Field label="E-mail">
          <Input
            name="email"
            type="email"
            required
            placeholder="voce@email.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Senha">
          <Input
            name="senha"
            type="password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
        </Field>

        {state.erro && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {state.erro}
          </p>
        )}

        <Button type="submit" loading={pending} className="mt-2">
          {role === "empresa" ? "Continuar cadastro" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  titulo,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  titulo: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1.5 rounded-2xl border-2 p-4 text-left transition-colors ${
        active
          ? "border-primary bg-primary/5"
          : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          active ? "bg-primary text-white" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-bold text-dark">{titulo}</span>
      <span className="text-xs text-muted">{desc}</span>
    </button>
  );
}
