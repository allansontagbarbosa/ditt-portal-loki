import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";
import { toast } from "sonner";

export interface AtualizarPerfilGrupoPayload {
  nome?: string | null;
  razao_social?: string | null;
  cnpj_matriz?: string | null;
  email?: string | null;
  telefone?: string | null;
  responsavel?: string | null;
  observacoes?: string | null;
}

export function useAtualizarMeuPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dados: AtualizarPerfilGrupoPayload) => {
      return await callRpc<unknown>("portal_atualizar_meu_perfil", {
        p_nome: dados.nome ?? null,
        p_razao_social: dados.razao_social ?? null,
        p_cnpj_matriz: dados.cnpj_matriz ?? null,
        p_email: dados.email ?? null,
        p_telefone: dados.telefone ?? null,
        p_responsavel: dados.responsavel ?? null,
        p_observacoes: dados.observacoes ?? null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portal", "meu-perfil"] });
      toast.success("Dados do grupo atualizados");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}
