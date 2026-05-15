import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Garantia {
  id: string;
  ordem_id: string;
  numero_os: string | null;
  data_inicio: string;
  data_fim: string;
  dias_garantia: number;
  status: string;
  ativa: boolean;
  dias_restantes: number;
  aparelho_marca: string | null;
  aparelho_modelo: string | null;
  aparelho_imei: string | null;
  observacoes: string | null;
}

interface MinhasGarantiasResponse {
  success: boolean;
  garantias?: Garantia[];
  error?: string;
}

export function useMinhasGarantias() {
  return useQuery<Garantia[]>({
    queryKey: ["minhas-garantias"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_minhas_garantias");
      if (error) throw new Error(error.message);
      const d = data as MinhasGarantiasResponse | null;
      if (!d?.success) throw new Error(d?.error ?? "Não foi possível carregar as garantias");
      return d.garantias ?? [];
    },
  });
}
