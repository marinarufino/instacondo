"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "../actions";
import { ConnexaMark } from "@/components/ConnexaLogo";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-10">
      {/* Marca */}
      <div className="mb-8 flex flex-col items-center text-center">
        <ConnexaMark size={64} />
        <h1 className="mt-3 text-2xl font-extrabold text-dark">Connexa</h1>
        <p className="mt-1 text-sm">
          <span className="text-dark">Conecta. Facilita. </span>
          <span className="text-accent">Transforma.</span>
        </p>
      </div>

      <h2 className="mb-1 text-xl font-bold text-dark">Bem-vindo de volta 👋</h2>
      <p className="mb-6 text-sm text-muted">Entre para acessar sua conta.</p>

      <form action={formAction} className="flex flex-col gap-4">
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
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Field>

        {state.erro && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {state.erro}
          </p>
        )}

        <Button type="submit" loading={pending} className="mt-2">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-primary">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
