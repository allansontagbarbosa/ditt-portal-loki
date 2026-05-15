import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Aparelho {
  id: string;
  marca: string | null;
  modelo: string | null;
  cor: string | null;
  capacidade: string | null;
  imei: string | null;
  created_at: string;
  qtd_oss: number;
  ultima_os_em: string | null;
}

interface MeusAparelhosResponse {
  success: boolean;
  aparelhos?: Aparelho[];
  error?: string;
}

export function useMeusAparelhos() {
  return useQuery<Aparelho[]>({
    queryKey: ["meus-aparelhos"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("portal_meus_aparelhos");
      if (error) throw new Error(error.message);
      const d = data as MeusAparelhosResponse | null;
      if (!d?.success) throw new Error(d?.error ?? "Não foi possível carregar seus aparelhos");
      return d.aparelhos ?? [];
    },
  });
}
