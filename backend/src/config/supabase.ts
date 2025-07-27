import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

// Service Key가 있으면 사용, 없으면 Anon Key 사용
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseKey) {
  throw new Error("Missing Supabase key (either SERVICE_KEY or ANON_KEY)");
}

console.log("Using Supabase URL:", supabaseUrl);
console.log("Using key type:", supabaseServiceKey ? "SERVICE_KEY" : "ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
