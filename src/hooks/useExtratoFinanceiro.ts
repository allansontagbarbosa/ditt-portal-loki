import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Lancamento {
  id: string;
  tipo: "os" | "pagamento";
  direcao: "debito" | "credito";
  data: string;
  descricao: string;
  valor: number;
  referencia: string | null;
}

export interface ExtratoFinanceiro {
  success: true;
  saldo: { total_faturado: number; total_pago: number; devedor: number };
  periodo_dias: number;
  lancamentos: Lancamento[];
}

export function useExtratoFinanceiro(dias = 90) {
  return useQuery<ExtratoFinanceiro>({
    queryKey: ["portal-extrato", dias],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_extrato_financeiro", { p_dias: dias });
      if (error) throw error;
      const d = data as { success: boolean; error?: string };
      if (!d?.success) throw new Error(d?.error ?? "Erro ao carregar extrato");
      return d as ExtratoFinanceiro;
    },
  });
}
