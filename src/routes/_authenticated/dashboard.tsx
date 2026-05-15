import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Loader2,
  AlertCircle,
  Wallet,
  PackageCheck,
  ShieldCheck,
  ListOrdered,
  ArrowRight,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { useDashboardLojista, type UltimaOrdem } from "@/hooks/useDashboardLojista";
import { fmtBRL, fmtData, statusInfo } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardLojista();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="text-sm text-destructive">
          {(error as Error)?.message ?? "Erro ao carregar"}
        </p>
      </div>
    );
  }

  const devendo = data.saldo.devedor > 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Boas-vindas,</p>
        <h1 className="text-2xl font-bold tracking-tight">{data.cliente_nome}</h1>
      </div>

      {/* Saldo card */}
      <div
        className={`rounded-2xl border p-5 ${
          devendo
            ? "border-destructive/30 bg-destructive/5"
            : "border-primary/30 bg-primary/5"
        }`}
      >
        <div className="flex items-center gap-2">
          <Wallet className={`h-4 w-4 ${devendo ? "text-destructive" : "text-primary"}`} />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {devendo ? "Saldo devedor" : "Sem saldo aberto"}
          </span>
        </div>
        <p className={`mt-2 text-3xl font-bold ${devendo ? "text-destructive" : "text-primary"}`}>
          {fmtBRL(data.saldo.devedor)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
          <div>
            <p className="text-xs text-muted-foreground">Faturado</p>
            <p className="text-sm font-semibold">{fmtBRL(data.saldo.total_faturado)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pago</p>
            <p className="text-sm font-semibold">{fmtBRL(data.saldo.total_pago)}</p>
          </div>
        </div>
      </div>

      {/* 3 KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard icon={PackageCheck} label="Entregues" valor={data.ordens.entregues} />
        <KpiCard
          icon={ShieldCheck}
          label="Garantias"
          valor={data.garantias_ativas}
          destaque={data.garantias_ativas > 0}
        />
        <KpiCard icon={ListOrdered} label="Total OSs" valor={data.ordens.total} />
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-1 gap-2">
        <ShortcutLink to="/financeiro" icon={Wallet} title="Financeiro" subtitle="Lançamentos e saldo" />
        <div className="grid grid-cols-2 gap-2">
          <ShortcutLink to="/aparelhos" icon={Smartphone} title="Aparelhos" />
          <ShortcutLink to="/garantias" icon={ShieldCheck} title="Garantias" />
        </div>
      </div>

      {/* Últimas OSs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Últimas ordens</h2>
          <Link
            to="/ordens"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {data.ultimas_ordens.length === 0 && (
          <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
            Nenhuma ordem registrada ainda.
          </div>
        )}
        <div className="space-y-2">
          {data.ultimas_ordens.map((os) => (
            <UltimaOrdemCard key={os.id} os={os} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface KpiProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  valor: number;
  destaque?: boolean;
}
function KpiCard({ icon: Icon, label, valor, destaque }: KpiProps) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        destaque ? "border-primary/40 bg-primary/5" : "bg-card"
      }`}
    >
      <Icon className={`mx-auto h-5 w-5 ${destaque ? "text-primary" : "text-muted-foreground"}`} />
      <p className={`mt-1 text-2xl font-bold ${destaque ? "text-primary" : "text-foreground"}`}>
        {valor}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function UltimaOrdemCard({ os }: { os: UltimaOrdem }) {
  const s = statusInfo(os.status);
  const data = os.data_conclusao ?? os.data_entrega ?? os.data_entrada;
  const aparelho =
    [os.aparelho?.marca, os.aparelho?.modelo].filter(Boolean).join(" ") ||
    "Aparelho sem modelo";
  const numero = os.numero_formatado ?? (os.numero != null ? `#${os.numero}` : "—");
  return (
    <Link
      to="/ordens/$id"
      params={{ id: os.id }}
      className="block rounded-xl border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{numero}</span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s.classes}`}
            >
              {s.label}
            </span>
          </div>
          <p className="truncate text-sm text-foreground">{aparelho}</p>
          <p className="text-xs text-muted-foreground">
            {fmtData(data)} · {fmtBRL(os.valor_total)}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}

function ShortcutLink({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: "/financeiro" | "/aparelhos" | "/garantias";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
