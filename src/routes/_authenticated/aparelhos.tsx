import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone, ShieldCheck, ChevronRight, AlertCircle } from "lucide-react";
import { useMeusAparelhos } from "@/hooks/useMeusAparelhos";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtData } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/aparelhos")({
  component: Aparelhos,
});

function Aparelhos() {
  const { data, isLoading, isError, error } = useMeusAparelhos();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meus aparelhos</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Aparelhos já registrados na Ditt
        </p>
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
      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nenhum aparelho registrado ainda
        </Card>
      )}

      <div className="space-y-2">
        {data?.map((a) => (
          <Link
            key={a.id}
            to="/ordens"
            className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {[a.marca, a.modelo].filter(Boolean).join(" ") || "Aparelho"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {[a.cor, a.capacidade].filter(Boolean).join(" · ") || "—"}
                  {a.imei ? ` · IMEI ${a.imei}` : ""}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {a.qtd_oss} {a.qtd_oss === 1 ? "ordem" : "ordens"}
                  {a.ultima_os_em ? ` · última em ${fmtData(a.ultima_os_em)}` : ""}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/garantias"
        className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
      >
        <ShieldCheck className="h-5 w-5 text-primary" />
        <span className="flex-1 text-sm font-medium">Ver garantias</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>
    </div>
  );
}
