import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, ClipboardList, User } from "lucide-react";
import { DittLogo } from "./DittLogo";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/ordens", label: "Ordens", icon: ClipboardList },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-screen-md items-center justify-between px-4">
          <DittLogo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-md flex-1 px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background">
        <div className="mx-auto flex max-w-screen-md">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
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
