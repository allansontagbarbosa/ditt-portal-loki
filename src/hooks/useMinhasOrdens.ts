import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";

export interface OrdemListItem {
  id: string;
  numero: number | null;
  numero_formatado: string | null;
  status: string;
  valor_total: number | null;
  data_entrada: string | null;
  data_conclusao: string | null;
  data_entrega: string | null;
  cliente_id?: string | null;
  cliente_nome: string | null;
  aparelho: {
    marca: string | null;
    modelo: string | null;
    imei: string | null;
  };
}

export interface MinhasOrdensResponse {
  ordens: OrdemListItem[];
  total: number;
}

export interface UseMinhasOrdensParams {
  status?: string;
  limit?: number;
  offset?: number;
}

export function useMinhasOrdens({ status, limit = 50, offset = 0 }: UseMinhasOrdensParams = {}) {
  return useQuery<MinhasOrdensResponse>({
    queryKey: ["portal", "ordens", { status: status ?? null, limit, offset }],
    queryFn: () =>
      callRpc<MinhasOrdensResponse>("portal_minhas_ordens", {
        p_status: status ?? null,
        p_limit: limit,
        p_offset: offset,
      }),
  });
}
