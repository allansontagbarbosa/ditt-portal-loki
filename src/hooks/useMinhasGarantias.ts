import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";

export interface Garantia {
  id: string;
  ordem_id: string;
  ordem_numero: string | number | null;
  data_inicio: string;
  data_fim: string;
  dias_garantia: number;
  status: string;
  ativa: boolean;
  dias_restantes: number;
  cliente_id?: string | null;
  cliente_nome: string | null;
  aparelho: { marca: string | null; modelo: string | null; imei: string | null };
  observacoes: string | null;
}

export interface MinhasGarantiasResponse {
  garantias: Garantia[];
  resumo: { total_ativas: number; expirando_30d: number; ja_expiradas: number };
}

export function useMinhasGarantias() {
  return useQuery<MinhasGarantiasResponse>({
    queryKey: ["portal", "garantias"],
    queryFn: () => callRpc<MinhasGarantiasResponse>("portal_minhas_garantias"),
  });
}
