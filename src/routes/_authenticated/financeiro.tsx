import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useExtratoFinanceiro, type Movimento } from "@/hooks/useExtratoFinanceiro";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowDown, ArrowUp, AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { fmtBRL, fmtData } from "@/lib/formatters";
import { LojaBadge } from "@/components/LojaBadge";
import { LojaSelector } from "@/components/LojaSelector";

export const Route = createFileRoute("/_authenticated/financeiro")({
  component: Financeiro,
});

const PERIODOS = [
  { dias: 30, label: "30 dias" },
  { dias: 60, label: "60 dias" },
  { dias: 90, label: "90 dias" },
  { dias: 180, label: "6 meses" },
] as const;

function Financeiro() {
  const [dias, setDias] = useState<number>(90);
  const [loja, setLoja] = useState<string | "todas">("todas");
  const { data, isLoading, isError, error } = useExtratoFinanceiro(dias);
  const [pagamentoAberto, setPagamentoAberto] = useState<Movimento | null>(null);

  const movimentos = useMemo(() => {
    const list = data?.movimentos ?? [];
    if (loja === "todas") return list;
    return list.filter((m) => m.cliente_id === loja);
  }, [data, loja]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Extrato financeiro</h1>
        <p className="text-sm font-medium text-muted-foreground">Saldo e movimentações</p>
      </div>

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
            <p className="mt-1 text-sm font-bold">{fmtBRL(data!.resumo.faturado)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pago</p>
            <p className="mt-1 text-sm font-bold">{fmtBRL(data!.resumo.pago)}</p>
          </Card>
          <Card
            className={`p-3 ${
              data!.resumo.devedor > 0
                ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900"
                : ""
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Em aberto</p>
            <p className={`mt-1 text-sm font-bold ${data!.resumo.devedor > 0 ? "text-amber-700 dark:text-amber-300" : ""}`}>
              {fmtBRL(data!.resumo.devedor)}
            </p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <LojaSelector value={loja} onChange={setLoja} />
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Movimentos</h2>
        {isLoading ? (
          <>
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </>
        ) : movimentos.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Sem movimentações nesse período
          </Card>
        ) : (
          movimentos.map((m, idx) => (
            <MovimentoRow
              key={`${m.tipo}-${m.ordem_id ?? m.data}-${idx}`}
              mov={m}
              onAbrirPagamento={setPagamentoAberto}
            />
          ))
        )}
      </div>

      <Sheet open={!!pagamentoAberto} onOpenChange={(open) => !open && setPagamentoAberto(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Detalhes do pagamento</SheetTitle>
          </SheetHeader>
          {pagamentoAberto && <DetalhePagamento mov={pagamentoAberto} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MovimentoRow({
  mov,
  onAbrirPagamento,
}: {
  mov: Movimento;
  onAbrirPagamento: (m: Movimento) => void;
}) {
  if (mov.tipo === "fatura" && mov.ordem_id) {
    return (
      <Link to="/ordens/$id" params={{ id: mov.ordem_id }} className="block">
        <MovimentoCard mov={mov} />
      </Link>
    );
  }
  if (mov.tipo === "pagamento") {
    return (
      <button type="button" onClick={() => onAbrirPagamento(mov)} className="block w-full text-left">
        <MovimentoCard mov={mov} />
      </button>
    );
  }
  return <MovimentoCard mov={mov} />;
}

function MovimentoCard({ mov }: { mov: Movimento }) {
  const credito = mov.tipo === "pagamento";
  const Icon = credito ? ArrowUp : ArrowDown;
  return (
    <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-accent">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          credito
            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-medium text-foreground">{mov.descricao}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{fmtData(mov.data)}</span>
          <LojaBadge nome={mov.cliente_nome} />
        </div>
      </div>
      <p className={`shrink-0 text-sm font-semibold ${credito ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
        {credito ? "+" : "−"}
        {fmtBRL(Math.abs(mov.valor))}
      </p>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Card>
  );
}

function DetalhePagamento({ mov }: { mov: Movimento }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-950/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor pago</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-400">
            {fmtBRL(Math.abs(mov.valor))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Data</p>
          <p className="mt-1 text-sm font-medium">{fmtData(mov.data)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Forma</p>
          <p className="mt-1 text-sm font-medium">{mov.forma_pagamento ?? "—"}</p>
        </div>
      </div>

      {mov.cliente_nome && (
        <div className="rounded-lg border p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Loja</p>
          <p className="mt-1 text-sm">{mov.cliente_nome}</p>
        </div>
      )}

      <div className="rounded-lg border p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Descrição</p>
        <p className="mt-1 text-sm">{mov.descricao}</p>
      </div>
    </div>
  );
}
