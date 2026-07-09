/** Tipos compartilhados do domínio Connexa */

export type UserRole = "sindico" | "empresa" | "admin";

export type Region = {
  id: string;
  nome: string;
  ativa: boolean;
};

export type Segment = {
  id: string;
  nome: string;
};

export type Profile = {
  id: string;
  role: UserRole;
  nome: string;
  email: string;
  telefone: string;
  region_id: string | null;
};

export type Company = {
  id: string;
  profile_id: string;
  cnpj: string;
  nome: string;
  descricao: string;
  cidade: string;
  onde_atende: string;
  servicos: string;
  region_id: string | null;
  segment_id: string | null;
  assinatura_ativa: boolean;
};
