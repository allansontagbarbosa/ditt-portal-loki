import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, AlertCircle, ChevronRight, Search } from "lucide-react";
import { useMinhasGarantias } from "@/hooks/useMinhasGarantias";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtData, fmtNumeroOS } from "@/lib/formatters";
import { LojaBadge } from "@/components/LojaBadge";
import { LojaSelector } from "@/components/LojaSelector";

export const Route = createFileRoute("/_authenticated/garantias")({
  component: Garantias,
});

const TABS = [
  { key: "ativas", label: "Ativas" },
  { key: "vencidas", label: "Vencidas" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Garantias() {
  const { data, isLoading, isError, error } = useMinhasGarantias();
  const [tab, setTab] = useState<TabKey>("ativas");
  const [loja, setLoja] = useState<string | "todas">("todas");
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    const all = data?.garantias ?? [];
    return all.filter((g) => {
      if (tab === "ativas" && !g.ativa) return false;
      if (tab === "vencidas" && g.ativa) return false;
      if (loja !== "todas" && g.cliente_id !== loja) return false;
      if (busca) {
        const b = busca.toLowerCase();
        const num = String(g.ordem_numero ?? "").toLowerCase();
        const modelo = String(g.aparelho?.modelo ?? "").toLowerCase();
        if (!num.includes(b) && !modelo.includes(b)) return false;
      }
      return true;
    });
  }, [data, tab, loja, busca]);

  const resumo = data?.resumo;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Garantias</h1>
        <p className="text-sm font-medium text-muted-foreground">Garantias dos reparos do grupo</p>
      </div>

      {resumo && (
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ativas</p>
            <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {resumo.total_ativas}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Expirando 30d</p>
            <p className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">
              {resumo.expirando_30d}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Vencidas</p>
            <p className="mt-1 text-lg font-bold text-muted-foreground">{resumo.ja_expiradas}</p>
          </Card>
        </div>
      )}

      <div className="flex gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <LojaSelector value={loja} onChange={setLoja} />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por OS# ou modelo…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}
      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {(error as Error)?.message}
        </div>
      )}
      {!isLoading && !isError && lista.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          {tab === "ativas" ? "Nenhuma garantia ativa" : "Nenhuma garantia vencida"}
        </Card>
      )}

      <div className="space-y-2">
        {lista.map((g) => {
          const alerta = g.ativa && g.dias_restantes < 30;
          return (
            <Link
              key={g.id}
              to="/ordens/$id"
              params={{ id: g.ordem_id }}
              className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    g.ativa
                      ? alerta
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">
                      {[g.aparelho?.marca, g.aparelho?.modelo].filter(Boolean).join(" ") || "Aparelho"}
                    </p>
                    <LojaBadge nome={g.cliente_nome} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    OS {fmtNumeroOS(g.ordem_numero) || "—"}
                    {g.aparelho?.imei ? ` · IMEI ${g.aparelho.imei}` : ""}
                  </p>
                  <p
                    className={`text-[11px] font-medium ${
                      g.ativa
                        ? alerta
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {g.ativa
                      ? `${g.dias_restantes} ${g.dias_restantes === 1 ? "dia restante" : "dias restantes"}`
                      : `Vencida em ${fmtData(g.data_fim)}`}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
