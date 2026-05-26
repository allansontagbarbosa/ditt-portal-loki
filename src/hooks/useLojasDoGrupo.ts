import { useQuery } from "@tanstack/react-query";
import { callRpc } from "@/lib/portal-rpc";

export interface LojaDoGrupo {
  cliente_id: string;
  cliente_nome: string;
  qtd_os_total: number;
  qtd_os_entregues: number;
  qtd_os_em_andamento: number;
  faturado: number;
  pago: number;
  devedor: number;
}

export interface LojasDoGrupoResponse {
  lojas: LojaDoGrupo[];
}

export function useLojasDoGrupo() {
  return useQuery<LojasDoGrupoResponse>({
    queryKey: ["portal", "lojas-do-grupo"],
    queryFn: () => callRpc<LojasDoGrupoResponse>("portal_lojas_do_grupo"),
    staleTime: 60_000,
  });
}
