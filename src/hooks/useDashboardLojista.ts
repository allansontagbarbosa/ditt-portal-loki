import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface UltimaOrdem {
  id: string;
  numero: number | null;
  numero_formatado: string | null;
  status: "entregue" | "cancelado";
  valor_total: number | null;
  data_entrada: string | null;
  data_conclusao: string | null;
  data_entrega: string | null;
  aparelho: {
    marca: string | null;
    modelo: string | null;
    imei: string | null;
  };
}

export interface DashboardLojistaResponse {
  success: true;
  cliente_id: string;
  cliente_nome: string;
  saldo: {
    total_faturado: number;
    total_pago: number;
    devedor: number;
  };
  ordens: {
    total: number;
    entregues: number;
    canceladas: number;
  };
  garantias_ativas: number;
  ultimas_ordens: UltimaOrdem[];
}

interface ErrorResponse {
  success: false;
  error?: string;
}

export function useDashboardLojista() {
  return useQuery<DashboardLojistaResponse>({
    queryKey: ["portal", "dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_dashboard_lojista");
      if (error) throw error;
      const d = data as DashboardLojistaResponse | ErrorResponse;
      if (!d.success) throw new Error((d as ErrorResponse).error ?? "Erro ao carregar dashboard");
      return d;
    },
  });
}
