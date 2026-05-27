export const fmtBRL = (valor: number | string | null | undefined): string => {
  const n = Number(valor ?? 0);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const fmtData = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
};

export interface StatusInfo {
  label: string;
  classes: string;
}

export function statusInfo(status: string | null | undefined): StatusInfo {
  const map: Record<string, StatusInfo> = {
    recebido: { label: "Recebido", classes: "bg-slate-500/10 text-slate-700 border-slate-500/30 dark:text-slate-300" },
    em_analise: { label: "Em análise", classes: "bg-purple-500/10 text-purple-700 border-purple-500/30 dark:text-purple-400" },
    em_diagnostico: { label: "Em diagnóstico", classes: "bg-purple-500/10 text-purple-700 border-purple-500/30 dark:text-purple-400" },
    aguardando_aprovacao: { label: "Aguardando aprovação", classes: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400" },
    aprovado: { label: "Aprovado", classes: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30 dark:text-cyan-300" },
    em_reparo: { label: "Em reparo", classes: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400" },
    em_andamento: { label: "Em andamento", classes: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400" },
    aguardando_peca: { label: "Aguardando peça", classes: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400" },
    pronto: { label: "Pronto pra retirar", classes: "bg-primary/10 text-primary border-primary/30" },
    pronta: { label: "Pronta pra retirar", classes: "bg-primary/10 text-primary border-primary/30" },
    entregue: { label: "Entregue", classes: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
    cancelado: { label: "Cancelado", classes: "bg-muted text-muted-foreground border-border" },
    cancelada: { label: "Cancelado", classes: "bg-muted text-muted-foreground border-border" },
  };
  return map[status ?? ""] ?? { label: status ?? "—", classes: "bg-muted text-muted-foreground border-border" };
}

export const STATUS_OPCOES = [
  { value: "todas", label: "Todos os status" },
  { value: "recebido", label: "Recebido" },
  { value: "em_analise", label: "Em análise" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { value: "aprovado", label: "Aprovado" },
  { value: "em_reparo", label: "Em reparo" },
  { value: "aguardando_peca", label: "Aguardando peça" },
  { value: "pronto", label: "Pronto pra retirar" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelada" },
] as const;
