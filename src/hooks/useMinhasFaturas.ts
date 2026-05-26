import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";

export interface FaturaItem {
  id: string;
  numero: number | null;
  numero_formatado: string | null;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  data_entrega: string | null;
  data_conclusao: string | null;
  cliente_id?: string;
  cliente_nome: string | null;
  aparelho: { marca: string | null; modelo: string | null; imei: string | null };
}

export interface PagamentoItem {
  id: string;
  cliente_id: string;
  cliente_nome: string | null;
  valor: number;
  data_pagamento: string | null;
  forma_pagamento: string | null;
  created_at: string | null;
}

export interface MinhasFaturasResponse {
  resumo: { total_faturado: number; total_pago: number; devedor: number };
  faturas: FaturaItem[];
  pagamentos: PagamentoItem[];
}

export function useMinhasFaturas(limit = 100, offset = 0) {
  return useQuery<MinhasFaturasResponse>({
    queryKey: ["portal", "faturas", { limit, offset }],
    queryFn: () =>
      callRpc<MinhasFaturasResponse>("portal_minhas_faturas", {
        p_limit: limit,
        p_offset: offset,
      }),
  });
}
