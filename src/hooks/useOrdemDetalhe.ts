import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";

export type AprovacaoOrcamento = "pendente" | "aprovado" | "reprovado";

export interface OrdemAparelho {
  marca: string | null;
  modelo: string | null;
  imei: string | null;
  imei2: string | null;
  cor: string | null;
  capacidade: string | null;
  estado_geral: string | null;
}

export interface OrdemGarantia {
  data_inicio: string;
  data_fim: string;
  status: string;
  dias_garantia: number;
}

export type ServicoBadge = "concluido" | "andamento" | "nao_iniciado";

export interface OrdemServico {
  id: string;
  nome: string;
  valor: number | null;
  categoria: string | null;
  status_raw: string | null;
  badge: ServicoBadge;
  badge_label: string;
  iniciado_em: string | null;
  concluido_em: string | null;
}

export interface OrdemTimelineEvento {
  evento: "recebido" | "aprovado" | "concluido" | "entregue" | string;
  data: string;
}

export interface OrdemDetalhe {
  id: string;
  numero: number | null;
  numero_formatado: string | null;
  status: string;
  defeito_relatado: string | null;
  diagnostico: string | null;
  servico_realizado: string | null;
  valor: number | null;
  valor_total: number | null;
  valor_pago: number | null;
  valor_pendente: number | null;
  custo_pecas: number | null;
  data_entrada: string | null;
  data_aprovacao: string | null;
  data_conclusao: string | null;
  data_entrega: string | null;
  previsao_entrega: string | null;
  aprovacao_orcamento: AprovacaoOrcamento | null;
  motivo_reprovacao: string | null;
  garantia_dias: number | null;
  observacoes: string | null;
  obs_cliente: string | null;
  prazo_vencido: boolean | null;
  aparelho: OrdemAparelho;
  cliente: { id: string; nome: string };
  garantia: OrdemGarantia | null;
  timeline: OrdemTimelineEvento[];
}

interface DetalheResponse {
  ordem: OrdemDetalhe;
}

export function useOrdemDetalhe(ordemId: string | undefined) {
  return useQuery<OrdemDetalhe>({
    queryKey: ["portal", "ordem", ordemId],
    enabled: !!ordemId,
    queryFn: async () => {
      const d = await callRpc<DetalheResponse>("portal_detalhe_ordem", { p_ordem_id: ordemId });
      if (!d?.ordem) throw new Error("Ordem não encontrada");
      return d.ordem;
    },
  });
}
