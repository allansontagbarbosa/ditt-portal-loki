import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, AlertCircle } from "lucide-react";
import { useOrdensLojista } from "@/hooks/useOrdensLojista";
import { OSCard } from "@/components/OSCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/ordens")({
  component: Ordens,
});

const FILTROS = [
  { key: "todas", label: "Todas" },
  { key: "entregue", label: "Entregue" },
  { key: "cancelado", label: "Cancelado" },
] as const;

type FiltroKey = (typeof FILTROS)[number]["key"];

function Ordens() {
  const { data: ordens, isLoading, isError, error } = useOrdensLojista();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroKey>("todas");

  const filtradas = useMemo(() => {
    const lista = ordens ?? [];
    return lista.filter((os) => {
      if (filtro !== "todas") {
        const st = (os.status ?? "").toLowerCase();
        if (filtro === "entregue" && st !== "entregue") return false;
        if (filtro === "cancelado" && st !== "cancelado" && st !== "cancelada") return false;
      }
      if (busca) {
        const b = busca.toLowerCase();
        const match =
          String(os.numero ?? "").toLowerCase().includes(b) ||
          String(os.aparelho_modelo ?? "").toLowerCase().includes(b);
        if (!match) return false;
      }
      return true;
    });
  }, [ordens, filtro, busca]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Suas ordens</h1>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por número ou modelo…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtros */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTROS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFiltro(key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filtro === key
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
          {busca || filtro !== "todas"
            ? "Nenhuma ordem encontrada com esses filtros"
            : "Nenhuma ordem ainda"}
        </div>
      )}
      <div className="space-y-2">
        {filtradas.map((os) => (
          <OSCard key={os.id} os={os} />
        ))}
      </div>

      {!isLoading && filtradas.length > 0 && (
        <p className="pt-2 text-center text-xs text-muted-foreground">
          {filtradas.length} {filtradas.length === 1 ? "ordem" : "ordens"}
        </p>
      )}
    </div>
  );
}
