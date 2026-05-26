import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";

export interface UltimaOrdem {
  id: string;
  numero: number | null;
  numero_formatado: string | null;
  status: string;
  valor: number | null;
  data_entrada: string | null;
  defeito_relatado: string | null;
  marca: string | null;
  modelo: string | null;
  cliente_nome: string | null;
}

export interface DashboardLojistaResponse {
  saldo: { faturado: number; pago: number; devedor: number };
  ordens: { total: number; entregues: number; canceladas: number };
  garantias_ativas: number;
  ultimas_ordens: UltimaOrdem[];
  grupo_id: string;
  grupo_nome: string;
  // aliases legados — não usar em UI nova
  cliente_id?: string;
  cliente_nome?: string;
}

export function useDashboardLojista() {
  return useQuery<DashboardLojistaResponse>({
    queryKey: ["portal", "dashboard"],
    queryFn: () => callRpc<DashboardLojistaResponse>("portal_dashboard_lojista"),
  });
}
