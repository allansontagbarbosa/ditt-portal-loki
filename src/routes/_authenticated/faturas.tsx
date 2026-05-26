import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ChevronRight, Receipt } from "lucide-react";
import { useMinhasFaturas } from "@/hooks/useMinhasFaturas";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtBRL, fmtData } from "@/lib/formatters";
import { LojaBadge } from "@/components/LojaBadge";
import { LojaSelector } from "@/components/LojaSelector";

export const Route = createFileRoute("/_authenticated/faturas")({
  component: FaturasPage,
});

const TABS = [
  { key: "aberto", label: "Em aberto" },
  { key: "pagas", label: "Pagas" },
  { key: "pagamentos", label: "Pagamentos" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function FaturasPage() {
  const { data, isLoading, isError, error } = useMinhasFaturas();
  const [tab, setTab] = useState<TabKey>("aberto");
  const [loja, setLoja] = useState<string | "todas">("todas");

  const faturasAberto = useMemo(
    () =>
      (data?.faturas ?? []).filter(
        (f) => (f.valor_pendente ?? 0) > 0 && (loja === "todas" || f.cliente_id === loja),
      ),
    [data, loja],
  );
  const faturasPagas = useMemo(
    () =>
      (data?.faturas ?? []).filter(
        (f) => (f.valor_pendente ?? 0) <= 0 && (loja === "todas" || f.cliente_id === loja),
      ),
    [data, loja],
  );
  const pagamentos = useMemo(
    () =>
      (data?.pagamentos ?? []).filter((p) => loja === "todas" || p.cliente_id === loja),
    [data, loja],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Faturas</h1>
        <p className="text-sm font-medium text-muted-foreground">Faturas e pagamentos do grupo</p>
      </div>

      {/* Resumo */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : isError ? (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {(error as Error)?.message}
        </div>
      ) : data ? (
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Faturado</p>
            <p className="mt-1 text-sm font-bold">{fmtBRL(data.resumo.total_faturado)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pago</p>
            <p className="mt-1 text-sm font-bold">{fmtBRL(data.resumo.total_pago)}</p>
          </Card>
          <Card className={`p-3 ${data.resumo.devedor > 0 ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900" : ""}`}>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Devedor</p>
            <p className={`mt-1 text-sm font-bold ${data.resumo.devedor > 0 ? "text-amber-700 dark:text-amber-300" : ""}`}>
              {fmtBRL(data.resumo.devedor)}
            </p>
          </Card>
        </div>
      ) : null}

      <LojaSelector value={loja} onChange={setLoja} />

      <div className="flex gap-1 rounded-full bg-muted p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "aberto" && <ListaFaturas faturas={faturasAberto} variant="aberto" />}
      {tab === "pagas" && <ListaFaturas faturas={faturasPagas} variant="pagas" />}
      {tab === "pagamentos" && (
        <div className="space-y-2">
          {pagamentos.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">Nenhum pagamento</Card>
          ) : (
            pagamentos.map((p) => (
              <Card key={p.id} className="flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  <Receipt className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{fmtBRL(p.valor)}</p>
                    <LojaBadge nome={p.cliente_nome} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fmtData(p.data_pagamento)} · {p.forma_pagamento ?? "—"}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ListaFaturas({
  faturas,
  variant,
}: {
  faturas: ReturnType<typeof useMinhasFaturas>["data"] extends infer T
    ? T extends { faturas: infer F }
      ? F
      : never
    : never;
  variant: "aberto" | "pagas";
}) {
  if (!faturas || faturas.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        {variant === "aberto" ? "Nenhuma fatura em aberto" : "Nenhuma fatura paga"}
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {faturas.map((f) => {
        const aparelho = [f.aparelho?.marca, f.aparelho?.modelo].filter(Boolean).join(" ") || "Aparelho";
        const numero = f.numero_formatado ?? (f.numero != null ? `#${f.numero}` : "—");
        return (
          <Link
            key={f.id}
            to="/ordens/$id"
            params={{ id: f.id }}
            className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{numero}</span>
                  <LojaBadge nome={f.cliente_nome} />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {aparelho}
                  {f.data_entrega ? ` · entregue ${fmtData(f.data_entrega)}` : ""}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                  <span className="text-muted-foreground">
                    Total <span className="font-semibold text-foreground">{fmtBRL(f.valor_total)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Pago <span className="font-semibold text-foreground">{fmtBRL(f.valor_pago)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Pendente{" "}
                    <span className={`font-semibold ${f.valor_pendente > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {fmtBRL(f.valor_pendente)}
                    </span>
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
