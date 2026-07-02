import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { CaseRecord } from "../types";

export function useCases() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setCases((data as CaseRecord[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("cases_room")
      .on("postgres_changes", { event: "*", schema: "public", table: "cases" }, () => {
        void refresh();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { cases, loading, refresh };
}

export async function insertCase(record: Omit<CaseRecord, "id" | "created_at">) {
  return supabase.from("cases").insert(record);
}
