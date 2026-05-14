import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { DittLogo } from "@/components/DittLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConviteInfo {
  valido: boolean;
  motivo?: "nao_encontrado" | "revogado" | "expirado";
  nome?: string;
  email_sugerido?: string;
  ja_tem_conta?: boolean;
  expira_em?: string;
}

export const Route = createFileRoute("/aceitar-convite/$token")({
  component: AceitarConvitePage,
});

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">{children}</div>
    </div>
  );
}

function AceitarConvitePage() {
  const { token } = Route.useParams();
  const nav = useNavigate();

  const [info, setInfo] = useState<ConviteInfo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [vinculando, setVinculando] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [submetendo, setSubmetendo] = useState(false);

  // 1. Consulta o convite ao montar
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("consultar_convite_publico", {
        p_token: token,
      });
      if (error) {
        setInfo({ valido: false, motivo: "nao_encontrado" });
      } else {
        const i = data as ConviteInfo;
        setInfo(i);
        if (i.email_sugerido) setEmail(i.email_sugerido);
      }
      setCarregando(false);
    })();
  }, [token]);

  // 2. Se já há sessão, tenta vincular direto
  useEffect(() => {
    if (carregando || !info?.valido) return;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setVinculando(true);
      const { data, error } = await supabase.rpc("aceitar_convite_cliente", {
        p_token: token,
      });
      const ok = (data as { success?: boolean } | null)?.success;
      if (!error && ok) {
        nav({ to: "/dashboard" });
      } else {
        setErro(
          (data as { error?: string } | null)?.error ??
            error?.message ??
            "Erro ao vincular convite",
        );
        setVinculando(false);
      }
    })();
  }, [carregando, info, token, nav]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("Senha precisa ter pelo menos 6 caracteres");
      return;
    }
    if (senha !== senha2) {
      setErro("Senhas não coincidem");
      return;
    }

    setSubmetendo(true);
    const emailNorm = email.trim().toLowerCase();
    const { data: signupData, error: signupErr } = await supabase.auth.signUp({
      email: emailNorm,
      password: senha,
    });

    if (signupErr) {
      if (/already registered|user already/i.test(signupErr.message)) {
        nav({
          to: "/login",
          search: { redirect: `/aceitar-convite/${token}`, email: emailNorm },
        });
        return;
      }
      setErro(signupErr.message);
      setSubmetendo(false);
      return;
    }

    if (!signupData.session) {
      setErro(
        "Conta criada mas sem sessão ativa. Verifique se 'Confirm email' está desativado no Supabase.",
      );
      setSubmetendo(false);
      return;
    }

    const { data, error } = await supabase.rpc("aceitar_convite_cliente", {
      p_token: token,
    });
    const ok = (data as { success?: boolean } | null)?.success;
    if (error || !ok) {
      setErro(
        (data as { error?: string } | null)?.error ??
          error?.message ??
          "Erro ao vincular convite",
      );
      setSubmetendo(false);
      return;
    }

    nav({ to: "/dashboard" });
  }

  if (carregando) {
    return (
      <CenteredCard>
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Verificando convite…</p>
        </div>
      </CenteredCard>
    );
  }

  if (!info?.valido) {
    const msg =
      info?.motivo === "expirado"
        ? "Esse convite expirou."
        : info?.motivo === "revogado"
          ? "Esse convite foi cancelado."
          : "Convite inválido ou não encontrado.";
    return (
      <CenteredCard>
        <div className="flex justify-center">
          <DittLogo />
        </div>
        <div className="rounded-xl border bg-card p-6 text-center text-card-foreground">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-lg font-semibold">Não foi possível abrir</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {msg} Peça um novo link ao seu ponto de contato Ditt.
          </p>
        </div>
      </CenteredCard>
    );
  }

  if (vinculando) {
    return (
      <CenteredCard>
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Vinculando seu acesso…</p>
        </div>
      </CenteredCard>
    );
  }

  return (
    <CenteredCard>
      <div className="flex justify-center">
        <DittLogo />
      </div>
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Boas-vindas, {info.nome}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie sua senha pra acessar o portal Ditt.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
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
            minLength={6}
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha2">Confirmar senha</Label>
          <Input
            id="senha2"
            type="password"
            required
            autoComplete="new-password"
            value={senha2}
            onChange={(e) => setSenha2(e.target.value)}
          />
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <Button type="submit" className="w-full" disabled={submetendo}>
          {submetendo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submetendo ? "Criando acesso…" : "Criar minha conta"}
        </Button>

        {info.ja_tem_conta && (
          <p className="text-center text-xs text-muted-foreground">
            Esse convite já foi aceito por outro acesso. Se foi você,{" "}
            <Link
              to="/login"
              search={{ redirect: `/aceitar-convite/${token}`, email }}
              className="font-medium text-primary underline"
            >
              faça login
            </Link>
            .
          </p>
        )}
      </form>
    </CenteredCard>
  );
}
