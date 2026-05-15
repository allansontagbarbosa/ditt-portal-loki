import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, FileText, Wallet, User } from "lucide-react";
import { DittLogo } from "./DittLogo";

const NAV = [
  { to: "/dashboard", label: "Início", icon: Home },
  { to: "/ordens", label: "Ordens", icon: FileText },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function Layout() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <DittLogo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background">
        <div className="mx-auto flex max-w-2xl">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = path === to || path.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
