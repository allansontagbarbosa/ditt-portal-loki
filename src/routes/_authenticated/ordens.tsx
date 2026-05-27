import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useMinhasOrdens } from "@/hooks/useMinhasOrdens";
import { useLojasDoGrupo } from "@/hooks/useLojasDoGrupo";
import { OSCard } from "@/components/OSCard";
import { LojaSelector } from "@/components/LojaSelector";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_OPCOES } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/ordens")({
  component: Ordens,
});

const LIMIT = 50;

function Ordens() {
  const [status, setStatus] = useState<string>("todas");
  const [loja, setLoja] = useState<string | "todas">("todas");
  const [busca, setBusca] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isFetching, isError, error } = useMinhasOrdens({
    status: status === "todas" ? undefined : status,
    limit: LIMIT,
    offset,
  });

  const { data: lojasData } = useLojasDoGrupo();
  const lojaNomeSelecionado = useMemo(() => {
    if (loja === "todas") return null;
    const found = lojasData?.lojas?.find((l) => l.cliente_id === loja);
    return found?.cliente_nome?.trim() ?? null;
  }, [loja, lojasData]);

  const filtradas = useMemo(() => {
    const lista = data?.ordens ?? [];
    return lista.filter((os) => {
      if (lojaNomeSelecionado && (os.cliente_nome ?? "").trim() !== lojaNomeSelecionado) return false;
      if (busca) {
        const b = busca.toLowerCase();
        const numStr = String(os.numero_formatado ?? os.numero ?? "").toLowerCase();
        const modelo = String(os.aparelho?.modelo ?? "").toLowerCase();
        const lojaNome = String(os.cliente_nome ?? "").toLowerCase();
        if (!numStr.includes(b) && !modelo.includes(b) && !lojaNome.includes(b)) return false;
      }
      return true;
    });
  }, [data, lojaNomeSelecionado, busca]);

  const total = data?.total ?? 0;
  const paginaAtual = Math.floor(offset / LIMIT) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / LIMIT));

  function resetPaginacao(setter: () => void) {
    setter();
    setOffset(0);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Suas ordens</h1>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <LojaSelector value={loja} onChange={(v) => resetPaginacao(() => setLoja(v))} />
        <select
          value={status}
          onChange={(e) => resetPaginacao(() => setStatus(e.target.value))}
          className="h-10 w-full appearance-none rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUS_OPCOES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, modelo ou loja…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      )}
      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {(error as Error)?.message}
        </div>
      )}
      {!isLoading && !isError && filtradas.length === 0 && (
        <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          {busca || loja !== "todas" || status !== "todas"
            ? "Nenhuma ordem encontrada com esses filtros"
            : "Nenhuma ordem ainda"}
        </div>
      )}

      <div className="space-y-2">
        {filtradas.map((os) => (
          <OSCard key={os.id} os={os} />
        ))}
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            disabled={offset === 0 || isFetching}
            onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </button>
          <span className="text-xs text-muted-foreground">
            {isFetching && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}
            Página {paginaAtual} de {totalPaginas} ({total} ordens)
          </span>
          <button
            type="button"
            disabled={offset + LIMIT >= total || isFetching}
            onClick={() => setOffset(offset + LIMIT)}
            className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            Próxima <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
