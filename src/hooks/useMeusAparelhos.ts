import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Aparelho {
  id: string;
  marca: string | null;
  modelo: string | null;
  cor: string | null;
  capacidade: string | null;
  imei: string | null;
  numero_serie: string | null;
  qtd_oss: number;
  ultima_os_em: string | null;
}

export function useMeusAparelhos() {
  return useQuery<Aparelho[]>({
    queryKey: ["meus-aparelhos"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_meus_aparelhos");
      if (error) throw error;
      const d = data as { success: boolean; aparelhos?: Aparelho[]; error?: string };
      if (!d?.success) throw new Error(d?.error ?? "Erro ao carregar aparelhos");
      return d.aparelhos ?? [];
    },
  });
}
