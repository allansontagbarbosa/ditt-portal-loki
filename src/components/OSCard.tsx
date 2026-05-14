import { Link } from "@tanstack/react-router";
import { ChevronRight, AlertCircle } from "lucide-react";
import { fmtBRL, fmtData, statusInfo } from "@/lib/formatters";

interface Props {
  os: {
    id: string;
    numero: string | number;
    status: string;
    valor_total: number;
    criada_em: string;
    aparelho_modelo: string | null;
    aguardando_aprovacao: boolean;
  };
}

export function OSCard({ os }: Props) {
  const s = statusInfo(os.status);
  return (
    <Link
      to="/ordens/$id"
      params={{ id: os.id }}
      className="block rounded-xl border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">#{os.numero}</span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s.classes}`}>
              {s.label}
            </span>
            {os.aguardando_aprovacao && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-3 w-3" /> aguardando você
              </span>
            )}
          </div>
          <p className="truncate text-sm text-foreground">
            {os.aparelho_modelo ?? "Aparelho sem modelo"}
          </p>
          <p className="text-xs text-muted-foreground">
            {fmtData(os.criada_em)} · {fmtBRL(os.valor_total)}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}
