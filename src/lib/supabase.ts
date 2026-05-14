import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://cgsdnvuigolxwzfmnykk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_8--rytxIxWlNNp2T9IUFsw_ems9dlOH";

// storageKey próprio para não conflitar com a sessão do app interno (smart-repairs-hub)
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storageKey: "ditt-portal-auth",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const PORTAL_URL =
  import.meta.env.VITE_PORTAL_URL ?? "https://portal.ditt.com";
