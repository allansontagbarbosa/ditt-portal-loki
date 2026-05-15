import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Garantia {
  id: string;
  ordem_id: string;
  numero_os: string | number;
  marca: string | null;
  modelo: string | null;
  imei: string | null;
  inicio_em: string;
  fim_em: string;
  ativa: boolean;
  dias_restantes: number;
}

export function useMinhasGarantias() {
  return useQuery<Garantia[]>({
    queryKey: ["minhas-garantias"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_minhas_garantias");
      if (error) throw error;
      const d = data as { success: boolean; garantias?: Garantia[]; error?: string };
      if (!d?.success) throw new Error(d?.error ?? "Erro ao carregar garantias");
      return d.garantias ?? [];
    },
  });
}
