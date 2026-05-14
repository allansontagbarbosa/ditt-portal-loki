import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Início</h1>
      <p className="text-sm text-muted-foreground">
        Saldo, KPIs e atalhos chegam na FASE 3D.
      </p>
      <div className="rounded-xl border bg-card p-6 text-card-foreground">
        <p className="text-sm text-muted-foreground">Placeholder do dashboard.</p>
      </div>
    </div>
  );
}
