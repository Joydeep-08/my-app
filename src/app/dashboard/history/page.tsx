// /app/dashboard/history/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

type Surprise = {
  id: string;
  recipient_name: string;
  occasion: string;
  status: string;
  unique_slug: string;
  created_at: string;
  expires_at: string;
  balloon_count: number;
};

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: rawSurprises, error } = await supabase
    .from("surprises")
    .select(
      `
      id,
      recipient_name,
      occasion,
      status,
      unique_slug,
      created_at,
      expires_at,
      balloons ( count )
    `
    )
    .eq("creator_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching surprises:", error.message);
  }

  const surprises: Surprise[] = (rawSurprises ?? []).map((s) => ({
    id: s.id as string,
    recipient_name: s.recipient_name as string,
    occasion: s.occasion as string,
    status: s.status as string,
    unique_slug: s.unique_slug as string,
    created_at: s.created_at as string,
    expires_at: s.expires_at as string,
    balloon_count:
      Array.isArray(s.balloons) && s.balloons.length > 0
        ? (s.balloons[0] as { count: number }).count
        : 0,
  }));

  return <HistoryClient surprises={surprises} />;
}