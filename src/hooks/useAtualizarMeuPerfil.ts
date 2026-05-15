import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useAtualizarMeuPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dados: Record<string, string | null>) => {
      const { data, error } = await supabase.rpc("portal_atualizar_meu_perfil", { p_dados: dados });
      if (error) throw error;
      const d = data as { success: boolean; error?: string };
      if (!d?.success) throw new Error(d?.error ?? "Erro ao salvar");
      return d;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meu-perfil"] });
      toast.success("Dados atualizados");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}
