import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, AlertCircle, ChevronRight } from "lucide-react";
import { useMinhasGarantias } from "@/hooks/useMinhasGarantias";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtData } from "@/lib/formatters";

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

  const lista = useMemo(() => {
    return (data ?? []).filter((g) => (tab === "ativas" ? g.ativa : !g.ativa));
  }, [data, tab]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Garantias</h1>
        <p className="text-sm font-medium text-muted-foreground">Garantias dos seus reparos</p>
      </div>

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
        {lista.map((g) => (
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
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {[g.aparelho_marca, g.aparelho_modelo].filter(Boolean).join(" ") || "Aparelho"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  OS #{g.numero_os ?? "—"}
                  {g.aparelho_imei ? ` · IMEI ${g.aparelho_imei}` : ""}
                </p>
                <p
                  className={`mt-1 text-[11px] font-medium ${
                    g.ativa
                      ? "text-emerald-700 dark:text-emerald-400"
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
        ))}
      </div>
    </div>
  );
}
