import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { Lead } from "../types";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("leads_room")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        void refresh();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { leads, loading, refresh };
}

/** Leads that are still in the pipeline (not completed or rejected). */
export function hasOpenLeads(leads: Lead[]): boolean {
  return leads.some((lead) => lead.status !== "completed" && lead.status !== "rejected");
}

export async function findOpenLeadForCustomer(phone: string, modelId: string): Promise<Lead | null> {
  const digits = phone.replace(/\D/g, "").slice(-10);
  const { data } = await supabase
    .from("leads")
    .select("*")
    .in("status", ["new", "contacted"])
    .eq("model_id", modelId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (!data?.length) return null;

  return (
    (data as Lead[]).find((lead) => lead.phone.replace(/\D/g, "").slice(-10) === digits) ?? null
  );
}

export async function insertLead(payload: {
  name: string;
  phone: string;
  address: string | null;
  pincode: string;
  model_id: string;
  model_name: string;
  source?: string;
}) {
  return supabase
    .from("leads")
    .insert({
      ...payload,
      status: "new",
      source: payload.source ?? "tata_web",
    })
    .select()
    .single();
}

export async function updateLeadStatus(id: string, status: string) {
  return supabase.from("leads").update({ status }).eq("id", id);
}

export async function deleteAllLeads() {
  return supabase.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}
