import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type AprovacaoOrcamento = "pendente" | "aprovado" | "reprovado";

export interface OrdemAparelho {
  id: string;
  marca: string | null;
  modelo: string | null;
  cor: string | null;
  capacidade: string | null;
  imei: string | null;
}

export interface OrdemDetalhe {
  id: string;
  numero: number | null;
  numero_formatado: string | null;
  status: "entregue" | "cancelado";
  data_entrada: string | null;
  previsao_entrega: string | null;
  data_entrega: string | null;
  data_conclusao: string | null;
  defeito_relatado: string | null;
  diagnostico: string | null;
  servico_realizado: string | null;
  observacoes: string | null;
  obs_cliente: string | null;
  valor_total: number | null;
  valor_pago: number | null;
  valor_pendente: number | null;
  desconto: number | null;
  sinal_pago: number | null;
  aprovacao_orcamento: AprovacaoOrcamento | null;
  orcamento_aprovado_em: string | null;
  orcamento_reprovado_em: string | null;
  orcamento_motivo_reprovacao: string | null;
  garantia_dias: number | null;
  prioridade: string | null;
  aparelho: OrdemAparelho;
}

interface DetalheOrdemResponse {
  success: boolean;
  ordem?: OrdemDetalhe;
  error?: string;
}

export function useOrdemDetalhe(ordemId: string | undefined) {
  return useQuery<OrdemDetalhe>({
    queryKey: ["portal", "ordem", ordemId],
    enabled: !!ordemId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_detalhe_ordem", {
        p_ordem_id: ordemId,
      });
      if (error) throw new Error(error.message);
      const d = data as DetalheOrdemResponse | null;
      if (!d?.success || !d.ordem) {
        throw new Error(d?.error ?? "Não foi possível carregar a ordem");
      }
      return d.ordem;
    },
  });
}
