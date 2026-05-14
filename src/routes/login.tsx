import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { DittLogo } from "@/components/DittLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginSearch {
  redirect?: string;
  email?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect, email: emailFromSearch } = Route.useSearch();
  const nav = useNavigate();

  const [email, setEmail] = useState(emailFromSearch ?? "");
  const [senha, setSenha] = useState("");
  const [submetendo, setSubmetendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Se já tem sessão, manda pra rota destino
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        nav({ to: redirect ?? "/dashboard" });
      }
    })();
  }, [nav, redirect]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSubmetendo(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      setErro(
        /invalid login/i.test(error.message)
          ? "E-mail ou senha incorretos"
          : error.message,
      );
      setSubmetendo(false);
      return;
    }

    nav({ to: redirect ?? "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <DittLogo />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Entrar no portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesso pra lojistas Ditt
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-card p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button type="submit" className="w-full" disabled={submetendo}>
            {submetendo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submetendo ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Não tem acesso ainda? Peça um link de convite ao seu contato Ditt.
        </p>
      </div>
    </div>
  );
}
