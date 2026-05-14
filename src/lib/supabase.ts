import { createClient } from "@supabase/supabase-js";

const url = "https://cgsdnvuigolxwzfmnykk.supabase.co";
const key = "sb_publishable_8--rytxIxWlNNp2T9IUFsw_ems9dlOH";

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "ditt-portal-auth",
  },
});
