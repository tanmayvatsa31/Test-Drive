import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { Lead, Qualification } from "../types";
import { upsertQualInSource } from "../leadIntentStatus";

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

    const poll = setInterval(() => void refresh(), 5000);
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
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
    .in("status", ["new", "contacted", "pending_slot"])
    .eq("model_id", modelId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (!data?.length) return null;

  return (
    (data as Lead[]).find((lead) => {
      if (lead.phone.replace(/\D/g, "").slice(-10) !== digits) return false;
      return !lead.source?.includes(":booked:");
    }) ?? null
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
  status?: string;
}) {
  return supabase
    .from("leads")
    .insert({
      ...payload,
      status: payload.status ?? "new",
      source: payload.source ?? "tata_web",
    })
    .select()
    .single();
}

/** Promote a pre-slot lead into the OEM pipeline once the customer picks a slot. */
export async function markLeadSlotBooked(leadId: string) {
  const bookedAt = new Date().toISOString();
  const { error } = await supabase
    .from("leads")
    .update({
      status: "new",
      source: `customer_app:booked:${bookedAt}`,
    })
    .eq("id", leadId);

  if (error) {
    console.warn("[leads] markLeadSlotBooked failed:", error.message);
    return supabase.from("leads").update({ status: "new" }).eq("id", leadId);
  }

  return { error: null };
}

export async function updateLeadStatus(id: string, status: string) {
  return supabase.from("leads").update({ status }).eq("id", id);
}

/** Persist Shivi / dealer intent on the lead row (encoded in source). */
export async function updateLeadQualification(id: string, qualification: Qualification) {
  const { data } = await supabase.from("leads").select("source").eq("id", id).single();
  const source = upsertQualInSource((data as Lead | null)?.source ?? "customer_app", qualification);
  return supabase.from("leads").update({ source }).eq("id", id);
}

/** Called when the driver closes the live job card with OTP. */
export async function updateLeadAfterRideComplete(id: string, qualification: Qualification) {
  const { data } = await supabase.from("leads").select("source").eq("id", id).single();
  const source = upsertQualInSource(
    (data as Lead | null)?.source ?? "customer_app",
    qualification,
    new Date().toISOString(),
  );
  const { error } = await supabase.from("leads").update({ status: "completed", source }).eq("id", id);
  if (error) {
    console.warn("[leads] updateLeadAfterRideComplete failed:", error.message);
  }
  return { error };
}

export async function deleteLead(id: string) {
  return supabase.from("leads").delete().eq("id", id);
}

export async function deleteAllLeads() {
  return supabase.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}
