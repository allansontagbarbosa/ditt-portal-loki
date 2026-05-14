import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
      <div className="rounded-xl border bg-card p-6 text-card-foreground">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">E-mail</p>
        <p className="mt-1 text-sm font-medium">{user?.email}</p>
      </div>
      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        Sair
      </Button>
    </div>
  );
}
