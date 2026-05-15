import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface MeuPerfil {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  documento: string | null;
  cep: string | null;
  rua: string | null;
  numero_endereco: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
}

export function useMeuPerfil() {
  return useQuery<MeuPerfil | null>({
    queryKey: ["meu-perfil"],
    queryFn: async () => {
      const { data: vinculo, error: e1 } = await supabase.rpc("get_my_cliente_lojista");
      if (e1) throw e1;
      const row = (vinculo as { cliente_id: string }[] | null)?.[0];
      if (!row) throw new Error("Cliente não encontrado");

      const { data: cli, error: e2 } = await supabase
        .from("clientes")
        .select(
          "id, nome, email, telefone, whatsapp, documento, cep, rua, numero_endereco, complemento, bairro, cidade, estado",
        )
        .eq("id", row.cliente_id)
        .maybeSingle();
      if (e2) throw e2;
      return cli as MeuPerfil | null;
    },
  });
}
