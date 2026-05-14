import { createFileRoute } from "@tanstack/react-router";
import { DittLogo } from "@/components/DittLogo";

export const Route = createFileRoute("/aceitar-convite/$token")({
  component: AceitarConvitePage,
});

function AceitarConvitePage() {
  const { token } = Route.useParams();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <DittLogo />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Aceitar convite</h1>
        <p className="text-sm text-muted-foreground">
          Token: <code className="font-mono">{token}</code>
        </p>
        <p className="text-xs text-muted-foreground">
          Placeholder — FASE 3C entrega o fluxo de criar senha.
        </p>
      </div>
    </div>
  );
}
