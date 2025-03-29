import { createClient } from "@supabase/supabase-js";

const supaBaseUrl: string = "https://uegyucxfkqdecsumgtaa.supabase.co";
const supaBaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supaBaseUrl, supaBaseAnonKey);