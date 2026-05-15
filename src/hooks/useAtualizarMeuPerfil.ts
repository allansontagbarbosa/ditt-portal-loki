import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface AtualizarPerfilPayload {
  telefone?: string;
  whatsapp?: string;
  cep?: string;
  rua?: string;
  numero_endereco?: string;
  complemento?: string | null;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

interface AtualizarPerfilResponse {
  success: boolean;
  error?: string;
}

export function useAtualizarMeuPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dados: AtualizarPerfilPayload) => {
      const { data, error } = await supabase.rpc("portal_atualizar_meu_perfil", {
        p_dados: dados,
      });
      if (error) throw new Error(error.message);
      const d = data as AtualizarPerfilResponse | null;
      if (!d?.success) throw new Error(d?.error ?? "Não foi possível salvar suas alterações");
      return d;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meu-perfil"] });
      toast.success("Dados atualizados");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}
