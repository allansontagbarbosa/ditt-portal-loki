import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ordens/$id")({
  component: OrdemDetalhePage,
});

function OrdemDetalhePage() {
  const { id } = Route.useParams();
  return (
    <div className="space-y-4">
      <Link
        to="/ordens"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Detalhe da OS</h1>
      <p className="font-mono text-xs text-muted-foreground break-all">{id}</p>
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        FASE 3E — detalhe completo + botões Aprovar/Reprovar virão aqui.
      </div>
    </div>
  );
}
