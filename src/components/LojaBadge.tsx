import { Store } from "lucide-react";

interface Props {
  nome: string | null | undefined;
  className?: string;
}

export function LojaBadge({ nome, className = "" }: Props) {
  if (!nome) return null;
  return (
    <span
      className={`inline-flex max-w-[160px] items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground ${className}`}
      title={nome}
    >
      <Store className="h-3 w-3 shrink-0 text-muted-foreground" />
      <span className="truncate">{nome}</span>
    </span>
  );
}
