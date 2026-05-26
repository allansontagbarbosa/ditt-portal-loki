import { Store } from "lucide-react";
import { useLojasDoGrupo } from "@/hooks/useLojasDoGrupo";

interface Props {
  value: string | "todas";
  onChange: (val: string | "todas") => void;
  className?: string;
}

export function LojaSelector({ value, onChange, className = "" }: Props) {
  const { data, isLoading } = useLojasDoGrupo();
  const lojas = data?.lojas ?? [];
  return (
    <div className={`relative ${className}`}>
      <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as string | "todas")}
        disabled={isLoading}
        className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="todas">Todas as lojas</option>
        {lojas.map((l) => (
          <option key={l.cliente_id} value={l.cliente_id}>
            {l.cliente_nome}
          </option>
        ))}
      </select>
    </div>
  );
}
