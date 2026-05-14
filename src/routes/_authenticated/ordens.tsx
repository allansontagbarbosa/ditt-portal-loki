import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ordens")({
  component: OrdensPage,
});

function OrdensPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Ordens</h1>
      <p className="text-sm text-muted-foreground">
        Lista de ordens chega na FASE 3D.
      </p>
    </div>
  );
}
