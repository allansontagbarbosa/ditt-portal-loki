import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Smartphone, ShieldCheck, ChevronRight, Loader2, AlertCircle, LogOut, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMeuPerfil, type MeuPerfil } from "@/hooks/useMeuPerfil";
import { useAtualizarMeuPerfil, type AtualizarPerfilPayload } from "@/hooks/useAtualizarMeuPerfil";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

type EditableField =
  | "telefone" | "whatsapp"
  | "cep" | "rua" | "numero_endereco" | "complemento" | "bairro" | "cidade" | "estado";

const EMPTY_FORM: Record<EditableField, string> = {
  telefone: "", whatsapp: "",
  cep: "", rua: "", numero_endereco: "", complemento: "", bairro: "", cidade: "", estado: "",
};

function PerfilPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: perfil, isLoading, isError, error } = useMeuPerfil();
  const atualizar = useAtualizarMeuPerfil();

  const [form, setForm] = useState<Record<EditableField, string>>(EMPTY_FORM);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (perfil) {
      setForm({
        telefone: perfil.telefone ?? "",
        whatsapp: perfil.whatsapp ?? "",
        cep: perfil.cep ?? "",
        rua: perfil.rua ?? "",
        numero_endereco: perfil.numero_endereco ?? "",
        complemento: perfil.complemento ?? "",
        bairro: perfil.bairro ?? "",
        cidade: perfil.cidade ?? "",
        estado: perfil.estado ?? "",
      });
      setDirty(false);
    }
  }, [perfil]);

  function set<K extends EditableField>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
  }

  async function handleCepBlur() {
    const raw = form.cep.replace(/\D/g, "");
    if (raw.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const j = await r.json();
      if (j.erro) return;
      setForm((f) => ({
        ...f,
        rua: j.logradouro || f.rua,
        bairro: j.bairro || f.bairro,
        cidade: j.localidade || f.cidade,
        estado: j.uf || f.estado,
      }));
      setDirty(true);
    } catch {
      /* silent */
    }
  }

  function handleSalvar() {
    const dados: AtualizarPerfilPayload = {};
    (Object.keys(form) as EditableField[]).forEach((k) => {
      const v = form[k].trim();
      if (k === "complemento") {
        dados.complemento = v || null;
      } else {
        dados[k] = v;
      }
    });
    atualizar.mutate(dados, { onSuccess: () => setDirty(false) });
  }

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  const inicial = (perfil?.nome ?? user?.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {inicial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{perfil?.nome ?? "—"}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
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

      {perfil && (
        <>
          {/* Documento (read-only) */}
          <Card className="p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Lock className="h-3 w-3" /> Documento
            </div>
            <p className="mt-1 text-sm font-medium">{perfil.documento ?? "—"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Para alterar, contate a Ditt.
            </p>
          </Card>

          {/* Contato */}
          <SectionCard title="Contato">
            <Field label="Telefone">
              <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
            </Field>
            <Field label="WhatsApp">
              <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            </Field>
          </SectionCard>

          {/* Endereço */}
          <SectionCard title="Endereço">
            <div className="grid grid-cols-2 gap-3">
              <Field label="CEP">
                <Input
                  value={form.cep}
                  onChange={(e) => set("cep", e.target.value)}
                  onBlur={handleCepBlur}
                />
              </Field>
              <Field label="Estado">
                <Input value={form.estado} onChange={(e) => set("estado", e.target.value)} maxLength={2} />
              </Field>
            </div>
            <Field label="Rua">
              <Input value={form.rua} onChange={(e) => set("rua", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Número">
                <Input value={form.numero_endereco} onChange={(e) => set("numero_endereco", e.target.value)} />
              </Field>
              <Field label="Complemento">
                <Input value={form.complemento} onChange={(e) => set("complemento", e.target.value)} />
              </Field>
            </div>
            <Field label="Bairro">
              <Input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} />
            </Field>
            <Field label="Cidade">
              <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
            </Field>
          </SectionCard>

          <Button
            className="w-full"
            disabled={!dirty || atualizar.isPending}
            onClick={handleSalvar}
          >
            {atualizar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {atualizar.isPending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </>
      )}

      {/* Atalhos */}
      <div className="space-y-2 pt-2">
        <ShortcutLink to="/aparelhos" icon={Smartphone} label="Meus aparelhos" />
        <ShortcutLink to="/garantias" icon={ShieldCheck} label="Garantias" />
      </div>

      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>
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

function ShortcutLink({
  to,
  icon: Icon,
  label,
}: {
  to: "/aparelhos" | "/garantias";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <Icon className="h-5 w-5 text-primary" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}

// Avoid unused-import lint when MeuPerfil is only structural
export type { MeuPerfil };
