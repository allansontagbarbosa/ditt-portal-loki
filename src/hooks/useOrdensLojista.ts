import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface OSItem {
  id: string;
  numero: string | number;
  status: string;
  valor_total: number;
  valor_pago: number | null;
  criada_em: string;
  data_prevista: string | null;
  aparelho_modelo: string | null;
  aguardando_aprovacao: boolean;
  orcamento_aprovado: boolean;
  orcamento_reprovado: boolean;
}

export type StatusFiltro =
  | "todas"
  | "aguardando_aprovacao"
  | "em_andamento"
  | "pronta"
  | "entregue"
  | "cancelada";

export function useOrdensLojista(filtro: StatusFiltro = "todas") {
  return useQuery<OSItem[]>({
    queryKey: ["portal", "ordens", filtro],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_listar_ordens", {
        p_status_filter: filtro,
      });
      if (error) throw error;
      const d = data as { success: boolean; ordens?: OSItem[]; error?: string };
      if (!d.success) throw new Error(d.error ?? "Erro ao listar");
      return d.ordens ?? [];
    },
  });
}
