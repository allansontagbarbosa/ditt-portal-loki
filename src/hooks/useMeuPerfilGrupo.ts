import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";

export interface PerfilGrupo {
  id: string;
  nome: string | null;
  razao_social: string | null;
  cnpj_matriz: string | null;
  email: string | null;
  telefone: string | null;
  responsavel: string | null;
  observacoes: string | null;
}

export interface PerfilLoja {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  qtd_aparelhos: number;
  qtd_os: number;
}

export interface MeuPerfilGrupoResponse {
  grupo: PerfilGrupo;
  user_email: string | null;
  lojas: PerfilLoja[];
}

export function useMeuPerfilGrupo() {
  return useQuery<MeuPerfilGrupoResponse>({
    queryKey: ["portal", "meu-perfil"],
    queryFn: () => callRpc<MeuPerfilGrupoResponse>("portal_meu_perfil"),
  });
}
