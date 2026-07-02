import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://goqutmktialwtqyjtgki.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcXV0bWt0aWFsd3RxeWp0Z2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTM0MDEsImV4cCI6MjA5Nzk4OTQwMX0.KUV8V5tBhqSvGZ6aChyJiR3hyWuaiUlaAcosmlgxsPE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
