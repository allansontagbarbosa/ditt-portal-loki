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
} from "lucide-react";
import { useOrdemDetalhe } from "@/hooks/useOrdemDetalhe";
import { useAprovarOrcamento, useReprovarOrcamento } from "@/hooks/useDecidirOrcamento";
import { fmtBRL, fmtData, statusInfo } from "@/lib/formatters";

export const Route = createFileRoute("/_authenticated/ordens/$id")({
  component: OrdemDetalhePage,
});

function OrdemDetalhePage() {
  const { id } = Route.useParams();
  const { data: os, isLoading, isError, error } = useOrdemDetalhe(id);

  const [modalRecusar, setModalRecusar] = useState(false);
  const [motivo, setMotivo] = useState("");

  const aprovar = useAprovarOrcamento();
  const reprovar = useReprovarOrcamento();

  function handleAprovar() {
    if (!os) return;
    const ok = window.confirm(`Aprovar este orçamento de ${fmtBRL(os.valor_total)}?`);
    if (!ok) return;
    aprovar.mutate(os.id);
  }

  function handleReprovarConfirma() {
    if (!os) return;
    reprovar.mutate(
      { osId: os.id, motivo: motivo.trim() || undefined },
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

  if (isError || !os) {
    return (
      <div className="space-y-4">
        <Link
          to="/ordens"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">
            {(error as Error)?.message ?? "OS não encontrada"}
          </p>
        </div>
      </div>
    );
  }

  const s = statusInfo(os.status);
  const orc = os.orcamento;
  const podeDecidir = orc.status === "pendente";

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
          <h1 className="text-2xl font-bold tracking-tight">#{os.numero}</h1>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s.classes}`}
          >
            {s.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Aberta em {fmtData(os.criada_em)}
          {os.data_prevista && ` · previsão ${fmtData(os.data_prevista)}`}
        </p>
      </div>

      {/* Aparelho */}
      <Section icon={Smartphone} title="Aparelho">
        <Linha label="Modelo" valor={os.aparelho.modelo ?? "—"} />
        {os.aparelho.marca && <Linha label="Marca" valor={os.aparelho.marca} />}
        {os.aparelho.numero_serie && <Linha label="Nº de série" valor={os.aparelho.numero_serie} />}
        {os.aparelho.imei && <Linha label="IMEI" valor={os.aparelho.imei} />}
      </Section>

      {/* Defeito */}
      {os.descricao_defeito && (
        <Section icon={FileText} title="Defeito relatado">
          <p className="text-sm text-foreground whitespace-pre-wrap">{os.descricao_defeito}</p>
        </Section>
      )}

      {/* Serviços */}
      <Section icon={Wrench} title="Serviços">
        {os.servicos.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
        )}
        <ul className="divide-y divide-border">
          {os.servicos.map((sv, i) => (
            <li key={i} className="flex justify-between gap-3 py-2 text-sm">
              <span className="text-foreground">{sv.descricao}</span>
              <span className="font-medium text-foreground whitespace-nowrap">
                {fmtBRL(sv.valor)}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Totais */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">{fmtBRL(os.valor_total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pago</span>
          <span className="font-medium">{fmtBRL(os.valor_pago ?? 0)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          <span className="text-sm font-medium">Saldo desta OS</span>
          <span
            className={`text-base font-bold ${os.saldo > 0 ? "text-destructive" : "text-primary"}`}
          >
            {fmtBRL(os.saldo)}
          </span>
        </div>
      </div>

      {/* Status do orçamento + botões */}
      <Section icon={CheckCircle2} title="Orçamento">
        {orc.status === "pendente" && (
          <p className="text-sm text-foreground">
            Aguardando sua decisão. Aprovar libera o reparo; recusar cancela o serviço.
          </p>
        )}
        {orc.status === "aprovado" && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Aprovado em {fmtData(orc.aprovado_em)}
          </p>
        )}
        {orc.status === "reprovado" && (
          <div className="space-y-1.5">
            <p className="text-sm text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Recusado em {fmtData(orc.reprovado_em)}
            </p>
            {orc.motivo_reprovacao && (
              <p className="text-xs text-muted-foreground">
                Motivo: <span className="text-foreground">{orc.motivo_reprovacao}</span>
              </p>
            )}
          </div>
        )}
        {orc.status === "finalizado" && (
          <p className="text-sm text-muted-foreground">
            OS já finalizada — sem ação pendente.
          </p>
        )}

        {podeDecidir && (
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleAprovar}
              disabled={aprovar.isPending || reprovar.isPending}
              className="flex-1 h-11 rounded-md bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
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
              className="flex-1 h-11 rounded-md border border-destructive/40 text-destructive font-medium text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 disabled:opacity-60"
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
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => !reprovar.isPending && setModalRecusar(false)}
        >
          <div
            className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border border-border p-5 space-y-3"
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
              className="w-full text-sm rounded-md border border-input bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setModalRecusar(false)}
                disabled={reprovar.isPending}
                className="flex-1 h-10 rounded-md border border-border text-sm font-medium hover:bg-muted disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleReprovarConfirma}
                disabled={reprovar.isPending}
                className="flex-1 h-10 rounded-md bg-destructive text-destructive-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
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
      <h2 className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h2>
      <div className="rounded-lg border border-border bg-card p-4">{children}</div>
    </section>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right ml-3 break-all">{valor}</span>
    </div>
  );
}
