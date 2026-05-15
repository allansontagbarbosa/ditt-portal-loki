import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const SUPABASE_URL = "https://cgsdnvuigolxwzfmnykk.supabase.co";
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
    try {
      const resp = await fetch(
        `${SUPABASE_URL}/functions/v1/aceitar-convite-portal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: senha }),
        },
      );
      const data = (await resp.json()) as {
        success?: boolean;
        error?: string;
        autologin?: boolean;
        cliente_nome?: string;
        session?: { access_token: string; refresh_token: string };
      };

      if (!data.success) {
        const msg = data.error ?? "Erro ao aceitar convite";
        setErro(msg);
        toast.error(msg);
        setSubmetendo(false);
        return;
      }

      if (data.autologin && data.session) {
        setVinculando(true);
        const { error } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (!error) {
          toast.success(`Bem-vindo, ${data.cliente_nome ?? ""}!`);
          nav({ to: "/dashboard" });
          return;
        }
      }

      toast.success("Conta criada! Faça login.");
      nav({ to: "/login" });
    } catch (e) {
      const msg = `Erro: ${(e as Error).message}`;
      setErro(msg);
      toast.error(msg);
      setSubmetendo(false);
    }
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
