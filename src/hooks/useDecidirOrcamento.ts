import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";
import { toast } from "sonner";

function invalidarTudo(qc: ReturnType<typeof useQueryClient>, osId: string) {
  qc.invalidateQueries({ queryKey: ["portal", "dashboard"] });
  qc.invalidateQueries({ queryKey: ["portal", "ordens"] });
  qc.invalidateQueries({ queryKey: ["portal", "ordem", osId] });
}

export function useAprovarOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (osId: string) => callRpc<unknown>("portal_aprovar_orcamento", { p_os_id: osId }),
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
    mutationFn: (args: { osId: string; motivo?: string }) =>
      callRpc<unknown>("portal_reprovar_orcamento", {
        p_os_id: args.osId,
        p_motivo: args.motivo ?? null,
      }),
    onSuccess: (_, vars) => {
      invalidarTudo(qc, vars.osId);
      toast.success("Orçamento recusado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
