import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface OSResumo {
  id: string;
  numero: string | number;
  status: string;
  valor_total: number;
  criada_em: string;
  aparelho_modelo: string | null;
  aguardando_aprovacao: boolean;
}

export interface DashboardData {
  success: boolean;
  cliente_nome: string;
  saldo_devedor: number;
  total_faturado: number;
  total_pago: number;
  qtd_aguardando_aprovacao: number;
  qtd_em_andamento: number;
  qtd_pronta_para_retirar: number;
  ultimas_oss: OSResumo[];
  error?: string;
}

export function useDashboardLojista() {
  return useQuery<DashboardData>({
    queryKey: ["portal", "dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_dashboard_lojista");
      if (error) throw error;
      const d = data as DashboardData;
      if (!d.success) throw new Error(d.error ?? "Erro ao carregar dashboard");
      return d;
    },
  });
}
