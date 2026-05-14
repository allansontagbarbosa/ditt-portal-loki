import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface OrdemDetalhe {
  id: string;
  numero: string | number;
  status: string;
  valor_total: number;
  valor_pago: number | null;
  saldo: number;
  criada_em: string;
  data_prevista: string | null;
  descricao_defeito: string | null;
  aparelho: {
    modelo: string | null;
    marca: string | null;
    numero_serie: string | null;
    imei: string | null;
  };
  servicos: Array<{ descricao: string; valor: number }>;
  orcamento: {
    status: "pendente" | "aprovado" | "reprovado" | "finalizado";
    aprovado_em: string | null;
    reprovado_em: string | null;
    motivo_reprovacao: string | null;
  };
}

export function useOrdemDetalhe(osId: string | undefined) {
  return useQuery<OrdemDetalhe>({
    queryKey: ["portal", "ordem", osId],
    enabled: !!osId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_detalhe_ordem", { p_os_id: osId });
      if (error) throw error;
      const d = data as { success: boolean; os?: OrdemDetalhe; error?: string };
      if (!d.success || !d.os) throw new Error(d.error ?? "OS não encontrada");
      return d.os;
    },
  });
}
