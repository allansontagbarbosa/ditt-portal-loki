import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useExtratoFinanceiro, type Lancamento } from "@/hooks/useExtratoFinanceiro";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, AlertCircle } from "lucide-react";
import { fmtBRL, fmtData } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/financeiro")({
  component: Financeiro,
});

const PERIODOS = [
  { dias: 30, label: "30 dias" },
  { dias: 90, label: "90 dias" },
  { dias: 180, label: "6 meses" },
  { dias: 365, label: "1 ano" },
] as const;

function Financeiro() {
  const [dias, setDias] = useState<number>(90);
  const { data, isLoading, isError, error } = useExtratoFinanceiro(dias);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-sm font-medium text-muted-foreground">Saldo e lançamentos</p>
      </div>

      {/* Saldo */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : isError ? (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {(error as Error)?.message ?? "Erro ao carregar"}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Faturado</p>
            <p className="mt-1 text-sm font-bold">{fmtBRL(data!.saldo.total_faturado)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pago</p>
            <p className="mt-1 text-sm font-bold">{fmtBRL(data!.saldo.total_pago)}</p>
          </Card>
          <Card
            className={`p-3 ${
              data!.saldo.devedor > 0
                ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900"
                : ""
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Em aberto</p>
            <p
              className={`mt-1 text-sm font-bold ${
                data!.saldo.devedor > 0 ? "text-amber-700 dark:text-amber-300" : ""
              }`}
            >
              {fmtBRL(data!.saldo.devedor)}
            </p>
          </Card>
        </div>
      )}

      {/* Períodos */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PERIODOS.map(({ dias: d, label }) => (
          <button
            key={d}
            type="button"
            onClick={() => setDias(d)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              dias === d
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lançamentos */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Lançamentos</h2>
        {isLoading ? (
          <>
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </>
        ) : (data?.lancamentos ?? []).length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Sem lançamentos nesse período
          </Card>
        ) : (
          data!.lancamentos.map((l) => <LancamentoRow key={l.id} lancamento={l} />)
        )}
      </div>
    </div>
  );
}

function LancamentoRow({ lancamento: l }: { lancamento: Lancamento }) {
  const credito = l.direcao === "credito";
  return (
    <Card className="flex items-center gap-3 p-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          credito
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        }`}
      >
        {credito ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{l.descricao}</p>
        <p className="text-xs text-muted-foreground">{fmtData(l.data)}</p>
      </div>
      <p
        className={`shrink-0 text-sm font-semibold ${
          credito ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
        }`}
      >
        {credito ? "+" : "−"}
        {fmtBRL(Math.abs(l.valor))}
      </p>
    </Card>
  );
}
