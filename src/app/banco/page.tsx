import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";

export default function BancoPage() {
  return (
    <div>
      <PageHeader
        title="Banco de Empresas"
        subtitle="Sua carteira de fornecedores, organizada por tema."
      />
      <ComingSoon etapa="Esta tela será construída na Etapa 5 — carteira de fornecedores agrupada por segmento." />
    </div>
  );
}
