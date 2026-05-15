import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Smartphone,
  FileText,
  Wrench,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useOrdemDetalhe } from "@/hooks/useOrdemDetalhe";
import { useAprovarOrcamento, useReprovarOrcamento } from "@/hooks/useDecidirOrcamento";
import { fmtBRL, fmtData, statusInfo } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/ordens_/$id")({
  component: OrdemDetalhePage,
});

function OrdemDetalhePage() {
  const { id } = Route.useParams();
  const { data: ordem, isLoading, isError, error } = useOrdemDetalhe(id);

  const [modalRecusar, setModalRecusar] = useState(false);
  const [motivo, setMotivo] = useState("");

  const aprovar = useAprovarOrcamento();
  const reprovar = useReprovarOrcamento();

  function handleAprovar() {
    if (!ordem) return;
    const ok = window.confirm(`Aprovar este orçamento de ${fmtBRL(ordem.valor_total ?? 0)}?`);
    if (!ok) return;
    aprovar.mutate(ordem.id);
  }

  function handleReprovarConfirma() {
    if (!ordem) return;
    reprovar.mutate(
      { osId: ordem.id, motivo: motivo.trim() || undefined },
      {
        onSuccess: () => {
          setModalRecusar(false);
          setMotivo("");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !ordem) {
    return (
      <div className="space-y-4">
        <Link
          to="/ordens"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
          <p className="text-sm text-destructive">
            {(error as Error)?.message ?? "Ordem não encontrada"}
          </p>
        </div>
      </div>
    );
  }

  const s = statusInfo(ordem.status);
  const aprov = ordem.aprovacao_orcamento;
  const podeDecidir = aprov === "pendente";
  const numero = ordem.numero_formatado ?? (ordem.numero != null ? String(ordem.numero) : "—");
  const valorTotal = ordem.valor_total ?? 0;
  const valorPago = ordem.valor_pago ?? 0;
  const valorPendente = ordem.valor_pendente ?? Math.max(valorTotal - valorPago, 0);
  const garantiaDias = ordem.garantia_dias ?? 0;

  return (
    <div className="space-y-5 pb-8">
      <Link
        to="/ordens"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      {/* Cabeçalho */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Ordem de serviço</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">#{numero}</h1>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s.classes}`}
          >
            {s.label}
          </span>
          {garantiaDias > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Garantia: {garantiaDias} dias
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {ordem.data_entrada && <>Aberta em {fmtData(ordem.data_entrada)}</>}
          {ordem.previsao_entrega && ` · previsão ${fmtData(ordem.previsao_entrega)}`}
          {ordem.data_entrega && ` · entregue em ${fmtData(ordem.data_entrega)}`}
        </p>
      </div>

      {/* Aparelho */}
      <Section icon={Smartphone} title="Aparelho">
        <Linha label="Modelo" valor={ordem.aparelho.modelo ?? "—"} />
        {ordem.aparelho.marca && <Linha label="Marca" valor={ordem.aparelho.marca} />}
        {ordem.aparelho.cor && <Linha label="Cor" valor={ordem.aparelho.cor} />}
        {ordem.aparelho.capacidade && (
          <Linha label="Capacidade" valor={ordem.aparelho.capacidade} />
        )}
        {ordem.aparelho.imei && <Linha label="IMEI" valor={ordem.aparelho.imei} />}
      </Section>

      {/* Defeito relatado */}
      {ordem.defeito_relatado && (
        <Section icon={FileText} title="Defeito relatado">
          <p className="whitespace-pre-wrap text-sm text-foreground">{ordem.defeito_relatado}</p>
        </Section>
      )}

      {/* Diagnóstico */}
      {ordem.diagnostico && (
        <Section icon={Stethoscope} title="Diagnóstico">
          <p className="whitespace-pre-wrap text-sm text-foreground">{ordem.diagnostico}</p>
        </Section>
      )}

      {/* Serviço realizado */}
      {ordem.servico_realizado && (
        <Section icon={Wrench} title="Serviço realizado">
          <p className="whitespace-pre-wrap text-sm text-foreground">{ordem.servico_realizado}</p>
        </Section>
      )}

      {/* Observações ao cliente */}
      {ordem.obs_cliente && (
        <Section icon={FileText} title="Observações">
          <p className="whitespace-pre-wrap text-sm text-foreground">{ordem.obs_cliente}</p>
        </Section>
      )}

      {/* Totais */}
      <div className="space-y-2 rounded-lg border border-border bg-card p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">{fmtBRL(valorTotal)}</span>
        </div>
        {(ordem.desconto ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Desconto</span>
            <span className="font-medium">−{fmtBRL(ordem.desconto ?? 0)}</span>
          </div>
        )}
        {(ordem.sinal_pago ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sinal pago</span>
            <span className="font-medium">{fmtBRL(ordem.sinal_pago ?? 0)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pago</span>
          <span className="font-medium">{fmtBRL(valorPago)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-sm font-medium">Em aberto</span>
          <span
            className={`text-base font-bold ${
              valorPendente > 0 ? "text-destructive" : "text-primary"
            }`}
          >
            {fmtBRL(valorPendente)}
          </span>
        </div>
      </div>

      {/* Status do orçamento + botões */}
      <Section icon={CheckCircle2} title="Orçamento">
        {aprov === "pendente" && (
          <p className="text-sm text-foreground">
            Aguardando sua decisão. Aprovar libera o reparo; recusar cancela o serviço.
          </p>
        )}
        {aprov === "aprovado" && (
          <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Aprovado em {fmtData(ordem.orcamento_aprovado_em)}
          </p>
        )}
        {aprov === "reprovado" && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              Recusado em {fmtData(ordem.orcamento_reprovado_em)}
            </p>
            {ordem.orcamento_motivo_reprovacao && (
              <p className="text-xs text-muted-foreground">
                Motivo:{" "}
                <span className="text-foreground">{ordem.orcamento_motivo_reprovacao}</span>
              </p>
            )}
          </div>
        )}
        {!aprov && (
          <p className="text-sm text-muted-foreground">Sem orçamento pendente.</p>
        )}

        {podeDecidir && (
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleAprovar}
              disabled={aprovar.isPending || reprovar.isPending}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {aprovar.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {aprovar.isPending ? "Aprovando…" : "Aprovar"}
            </button>
            <button
              onClick={() => setModalRecusar(true)}
              disabled={aprovar.isPending || reprovar.isPending}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-destructive/40 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Recusar
            </button>
          </div>
        )}
      </Section>

      {/* Modal de recusar */}
      {modalRecusar && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={() => !reprovar.isPending && setModalRecusar(false)}
        >
          <div
            className="w-full space-y-3 rounded-t-2xl border border-border bg-card p-5 sm:max-w-md sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold">Recusar orçamento</h3>
            <p className="text-xs text-muted-foreground">
              Quer deixar um motivo? (opcional, ajuda a oficina a entender)
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Ex: valor acima do esperado, vou usar o aparelho como está…"
              className="w-full resize-none rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setModalRecusar(false)}
                disabled={reprovar.isPending}
                className="h-10 flex-1 rounded-md border border-border text-sm font-medium hover:bg-muted disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleReprovarConfirma}
                disabled={reprovar.isPending}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-destructive text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-60"
              >
                {reprovar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {reprovar.isPending ? "Recusando…" : "Confirmar recusa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}
function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h2>
      <div className="rounded-lg border border-border bg-card p-4">{children}</div>
    </section>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-3 break-all text-right font-medium">{valor}</span>
    </div>
  );
}
