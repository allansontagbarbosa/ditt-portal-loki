import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, AlertCircle, Wallet, Clock, Wrench, PackageCheck, ArrowRight, Smartphone, ShieldCheck, ChevronRight } from "lucide-react";
import { useDashboardLojista } from "@/hooks/useDashboardLojista";
import { fmtBRL } from "@/lib/formatters";
import { OSCard } from "@/components/OSCard";

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

  const devendo = data.saldo_devedor > 0;

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
          {fmtBRL(data.saldo_devedor)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
          <div>
            <p className="text-xs text-muted-foreground">Faturado</p>
            <p className="text-sm font-semibold">{fmtBRL(data.total_faturado)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pago</p>
            <p className="text-sm font-semibold">{fmtBRL(data.total_pago)}</p>
          </div>
        </div>
      </div>

      {/* 3 KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          icon={Clock}
          label="Aguardando"
          valor={data.qtd_aguardando_aprovacao}
          destaque={data.qtd_aguardando_aprovacao > 0}
        />
        <KpiCard
          icon={Wrench}
          label="Em andamento"
          valor={data.qtd_em_andamento}
        />
        <KpiCard
          icon={PackageCheck}
          label="Pronta"
          valor={data.qtd_pronta_para_retirar}
          destaque={data.qtd_pronta_para_retirar > 0}
        />
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
        {data.ultimas_oss.length === 0 && (
          <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
            Nenhuma ordem registrada ainda.
          </div>
        )}
        <div className="space-y-2">
          {data.ultimas_oss.map((os) => (
            <OSCard key={os.id} os={os} />
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
