"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";
import { salvarEmpresa } from "./actions";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import type { Region, Segment } from "@/lib/types";

export default function EmpresaCadastroForm({
  regioes,
  segmentos,
}: {
  regioes: Region[];
  segmentos: Segment[];
}) {
  const [state, formAction, pending] = useActionState(salvarEmpresa, {});

  return (
    <div className="flex-1">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-primary-light px-6 pb-6 pt-8 text-white">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <Building2 size={24} />
        </span>
        <h1 className="mt-3 text-2xl font-bold">Dados da empresa</h1>
        <p className="mt-1 text-sm text-white/85">
          Preencha as informações que os síndicos vão ver.
        </p>
      </header>

      <form action={formAction} className="flex flex-col gap-4 px-6 py-6">
        <Field label="Nome da empresa">
          <Input name="nome" required placeholder="Ex.: Clean Master" />
        </Field>
        <Field label="CNPJ">
          <Input name="cnpj" placeholder="00.000.000/0000-00" />
        </Field>
        <Field label="Telefone">
          <Input name="telefone" placeholder="(21) 90000-0000" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Segmento">
            <Select name="segment_id" required defaultValue="">
              <option value="" disabled>
                Selecione
              </option>
              {segmentos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Região">
            <Select name="region_id" required defaultValue="">
              <option value="" disabled>
                Selecione
              </option>
              {regioes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Cidade">
          <Input name="cidade" placeholder="Ex.: Rio de Janeiro" />
        </Field>
        <Field label="Onde atende">
          <Input name="onde_atende" placeholder="Ex.: Zona Sul e Barra" />
        </Field>
        <Field label="Serviços que realiza">
          <Input name="servicos" placeholder="Ex.: Limpeza pós-obra, jardins" />
        </Field>
        <Field label="Descrição da empresa">
          <Input name="descricao" placeholder="Conte um pouco sobre a empresa" />
        </Field>

        {state.erro && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {state.erro}
          </p>
        )}

        <Button type="submit" loading={pending} className="mt-2">
          Continuar para assinatura
        </Button>
      </form>
    </div>
  );
}
