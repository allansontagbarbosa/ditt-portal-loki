import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useOrdensLojista, type StatusFiltro } from "@/hooks/useOrdensLojista";
import { OSCard } from "@/components/OSCard";

export const Route = createFileRoute("/_authenticated/ordens")({
  component: OrdensPage,
});

const FILTROS: { value: StatusFiltro; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "aguardando_aprovacao", label: "Aguardando" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "pronta", label: "Pronta" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelada", label: "Cancelada" },
];

function OrdensPage() {
  const [filtro, setFiltro] = useState<StatusFiltro>("todas");
  const { data, isLoading, isError, error } = useOrdensLojista(filtro);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Suas ordens</h1>

      {/* Chips de filtro */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFiltro(f.value)}
            className={`flex h-8 flex-shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors ${
              filtro === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{(error as Error)?.message}</p>
        </div>
      )}
      {data && data.length === 0 && (
        <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Nenhuma ordem com esse filtro.
        </div>
      )}
      <div className="space-y-2">
        {data?.map((os) => (
          <OSCard key={os.id} os={os} />
        ))}
      </div>
    </div>
  );
}
