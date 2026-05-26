import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";

export interface Movimento {
  tipo: "fatura" | "pagamento";
  data: string;
  valor: number;
  descricao: string;
  ordem_id?: string | null;
  ordem_numero?: string | number | null;
  forma_pagamento?: string | null;
  cliente_id?: string | null;
  cliente_nome: string | null;
}

export interface ExtratoFinanceiroResponse {
  resumo: { faturado: number; pago: number; devedor: number };
  periodo_dias: number;
  movimentos: Movimento[];
}

export function useExtratoFinanceiro(dias = 90) {
  return useQuery<ExtratoFinanceiroResponse>({
    queryKey: ["portal", "extrato", dias],
    queryFn: () =>
      callRpc<ExtratoFinanceiroResponse>("portal_extrato_financeiro", { p_dias: dias }),
  });
}
