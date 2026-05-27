import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle, LogOut, Lock, Store, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useMeuPerfilGrupo } from "@/hooks/useMeuPerfilGrupo";
import { useAtualizarMeuPerfil, type AtualizarPerfilGrupoPayload } from "@/hooks/useAtualizarMeuPerfil";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

type FieldKey = keyof AtualizarPerfilGrupoPayload;

const EMPTY: Record<FieldKey, string> = {
  nome: "",
  razao_social: "",
  cnpj_matriz: "",
  email: "",
  telefone: "",
  responsavel: "",
  observacoes: "",
};

function isDirty(v: string | null | undefined): boolean {
  if (!v) return false;
  const t = String(v).trim();
  return t !== "" && t !== "0" && t !== "-";
}

function PerfilPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useMeuPerfilGrupo();
  const atualizar = useAtualizarMeuPerfil();

  const [form, setForm] = useState<Record<FieldKey, string>>(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    if (data?.grupo) {
      setForm({
        nome: data.grupo.nome ?? "",
        razao_social: data.grupo.razao_social ?? "",
        cnpj_matriz: data.grupo.cnpj_matriz ?? "",
        email: data.grupo.email ?? "",
        telefone: data.grupo.telefone ?? "",
        responsavel: data.grupo.responsavel ?? "",
        observacoes: data.grupo.observacoes ?? "",
      });
      setDirty(false);
    }
  }, [data]);

  function set(key: FieldKey, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
  }

  function handleSalvar() {
    const payload: AtualizarPerfilGrupoPayload = {};
    (Object.keys(form) as FieldKey[]).forEach((k) => {
      const v = form[k].trim();
      payload[k] = v === "" ? null : v;
    });
    atualizar.mutate(payload, { onSuccess: () => setDirty(false) });
  }

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  const inicial = (data?.grupo?.nome ?? user?.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {inicial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{data?.grupo?.nome ?? "—"}</p>
          <p className="truncate text-xs text-muted-foreground">{data?.user_email ?? user?.email}</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      )}
      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {(error as Error)?.message}
        </div>
      )}

      {data && (
        <>
          {/* Conta */}
          <SectionCard title="Conta">
            <div>
              <Label className="text-xs text-muted-foreground">Email de login</Label>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                <Lock className="h-3 w-3 text-muted-foreground" />
                {data.user_email ?? user?.email ?? "—"}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setPwOpen(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Trocar senha
            </Button>
          </SectionCard>

          {/* Dados do Grupo */}
          <SectionCard title="Dados do grupo">
            <Field label="Nome do grupo">
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
            </Field>
            <Field label="Razão social">
              <Input value={form.razao_social} onChange={(e) => set("razao_social", e.target.value)} />
            </Field>
            <Field label="CNPJ matriz">
              <Input value={form.cnpj_matriz} onChange={(e) => set("cnpj_matriz", e.target.value)} />
            </Field>
            <Field label="Email de contato">
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Telefone">
              <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
            </Field>
            <Field label="Responsável">
              <Input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} />
            </Field>
            <Field label="Observações">
              <Input value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
            </Field>
          </SectionCard>

          <Button className="w-full" disabled={!dirty || atualizar.isPending} onClick={handleSalvar}>
            {atualizar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {atualizar.isPending ? "Salvando…" : "Salvar alterações"}
          </Button>

          {/* Minhas lojas */}
          <SectionCard title={`Minhas lojas (${data.lojas.length})`}>
            <div className="grid grid-cols-1 gap-2">
              {data.lojas.map((l) => (
                <div key={l.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <p className="truncate text-sm font-semibold">{l.nome}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span>{l.qtd_os} OSs</span>
                    <span>{l.qtd_aparelhos} aparelhos</span>
                    {isDirty(l.telefone) && <span>Tel: {l.telefone}</span>}
                    {isDirty(l.email) && <span>{l.email}</span>}
                  </div>
                  {isDirty(l.endereco) && (
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">{l.endereco}</p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>

      <TrocarSenhaModal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        email={data?.user_email ?? user?.email ?? null}
        onSuccess={async () => {
          setPwOpen(false);
          toast.success("Senha alterada. Você será desconectado e precisará entrar novamente.");
          await signOut();
          navigate({ to: "/login" });
        }}
      />
    </div>
  );
}

function TrocarSenhaModal({
  open,
  onClose,
  email,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  email: string | null;
  onSuccess: () => void;
}) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [conf, setConf] = useState("");
  const [showA, setShowA] = useState(false);
  const [showN, setShowN] = useState(false);
  const [showC, setShowC] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setAtual("");
      setNova("");
      setConf("");
      setShowA(false);
      setShowN(false);
      setShowC(false);
      setLoading(false);
    }
  }, [open]);

  async function handleSubmit() {
    if (!email) {
      toast.error("Email não identificado");
      return;
    }
    if (nova.length < 8) {
      toast.error("Nova senha deve ter ao menos 8 caracteres");
      return;
    }
    if (nova === atual) {
      toast.error("Nova senha deve ser diferente da atual");
      return;
    }
    if (nova !== conf) {
      toast.error("Confirmação não confere");
      return;
    }
    setLoading(true);
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password: atual });
    if (signErr) {
      setLoading(false);
      toast.error("Senha atual incorreta");
      return;
    }
    const { error: updErr } = await supabase.auth.updateUser({ password: nova });
    setLoading(false);
    if (updErr) {
      toast.error(`Erro: ${updErr.message}`);
      return;
    }
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trocar senha</DialogTitle>
          <DialogDescription>
            Mínimo de 8 caracteres. Você será desconectado após a troca.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <PasswordField label="Senha atual" value={atual} onChange={setAtual} show={showA} toggle={() => setShowA((s) => !s)} />
          <PasswordField label="Nova senha" value={nova} onChange={setNova} show={showN} toggle={() => setShowN((s) => !s)} />
          <PasswordField label="Confirmar nova senha" value={conf} onChange={setConf} show={showC} toggle={() => setShowC((s) => !s)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Alterando…" : "Alterar senha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  toggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggle: () => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Esconder senha" : "Mostrar senha"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-3 p-4">
      <h2 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
