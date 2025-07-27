const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey ? "Present" : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("Testing Supabase connection...");

    // 간단한 테스트 쿼리 - 테이블 존재 확인
    const { data, error } = await supabase.from("jobs").select("*").limit(1);

    if (error) {
      console.error("Supabase error:", error);
    } else {
      console.log("Connection successful!", data);
    }
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testConnection();
