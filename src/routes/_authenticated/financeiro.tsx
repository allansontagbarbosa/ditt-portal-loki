import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useExtratoFinanceiro, type Lancamento } from "@/hooks/useExtratoFinanceiro";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArrowDown, ArrowUp, AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
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
  const [pagamentoAberto, setPagamentoAberto] = useState<Lancamento | null>(null);

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
          data!.lancamentos.map((l) => (
            <LancamentoRow
              key={l.id}
              lancamento={l}
              onAbrirPagamento={setPagamentoAberto}
            />
          ))
        )}
      </div>

      <Sheet
        open={!!pagamentoAberto}
        onOpenChange={(open) => !open && setPagamentoAberto(null)}
      >
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Detalhes do pagamento</SheetTitle>
          </SheetHeader>
          {pagamentoAberto && <DetalhePagamento lancamento={pagamentoAberto} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LancamentoRow({
  lancamento,
  onAbrirPagamento,
}: {
  lancamento: Lancamento;
  onAbrirPagamento: (l: Lancamento) => void;
}) {
  if (lancamento.tipo === "os") {
    return (
      <Link to="/ordens/$id" params={{ id: lancamento.id }} className="block">
        <LancamentoCard lancamento={lancamento} />
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onAbrirPagamento(lancamento)}
      className="block w-full text-left"
    >
      <LancamentoCard lancamento={lancamento} />
    </button>
  );
}

function LancamentoCard({ lancamento: l }: { lancamento: Lancamento }) {
  const credito = l.direcao === "credito";
  const Icon = credito ? ArrowUp : ArrowDown;
  return (
    <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-accent cursor-pointer">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          credito
            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{l.descricao}</p>
        <p className="text-xs text-muted-foreground">{fmtData(l.data)}</p>
      </div>
      <p
        className={`shrink-0 text-sm font-semibold ${
          credito ? "text-green-700 dark:text-green-400" : "text-foreground"
        }`}
      >
        {credito ? "+" : "−"}
        {fmtBRL(Math.abs(l.valor))}
      </p>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Card>
  );
}

function DetalhePagamento({ lancamento }: { lancamento: Lancamento }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-950/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor pago</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-400">
            {fmtBRL(Math.abs(lancamento.valor))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Data</p>
          <p className="mt-1 text-sm font-medium">{fmtData(lancamento.data)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tipo</p>
          <p className="mt-1 text-sm font-medium">Pagamento</p>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Descrição</p>
        <p className="mt-1 text-sm">{lancamento.descricao}</p>
      </div>

      {lancamento.referencia && (
        <div className="rounded-lg border p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Referência</p>
          <p className="mt-1 font-mono text-xs">{lancamento.referencia}</p>
        </div>
      )}
    </div>
  );
}
