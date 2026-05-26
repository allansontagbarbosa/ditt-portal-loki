import { supabase } from "@/lib/supabase";

/**
 * Helper único para chamar RPCs do portal lojista (API nova).
 * - Lança o erro de transporte (PostgREST) se houver.
 * - Se o body retornar uma chave `error` string, lança esse texto.
 * - Senão devolve o body tipado.
 *
 * Substitui o antigo padrão `{ success: true, ... }`.
 */
export async function callRpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args ?? {});
  if (error) throw new Error(error.message);
  if (
    data &&
    typeof data === "object" &&
    "error" in (data as Record<string, unknown>) &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    throw new Error((data as { error: string }).error);
  }
  return data as T;
}
