import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

function invalidarTudo(qc: ReturnType<typeof useQueryClient>, osId: string) {
  qc.invalidateQueries({ queryKey: ["portal", "dashboard"] });
  qc.invalidateQueries({ queryKey: ["portal", "ordens"] });
  qc.invalidateQueries({ queryKey: ["portal", "ordem", osId] });
}

export function useAprovarOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (osId: string) => {
      const { data, error } = await supabase.rpc("portal_aprovar_orcamento", { p_os_id: osId });
      if (error) throw error;
      const d = data as { success: boolean; error?: string };
      if (!d.success) throw new Error(d.error ?? "Erro ao aprovar");
      return d;
    },
    onSuccess: (_, osId) => {
      invalidarTudo(qc, osId);
      toast.success("Orçamento aprovado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReprovarOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { osId: string; motivo?: string }) => {
      const { data, error } = await supabase.rpc("portal_reprovar_orcamento", {
        p_os_id: args.osId,
        p_motivo: args.motivo ?? null,
      });
      if (error) throw error;
      const d = data as { success: boolean; error?: string };
      if (!d.success) throw new Error(d.error ?? "Erro ao recusar");
      return d;
    },
    onSuccess: (_, vars) => {
      invalidarTudo(qc, vars.osId);
      toast.success("Orçamento recusado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
