import { createClient } from "@/lib/supabase/server";
import RecipientClient from "./RecipientClient";

export const revalidate = 3600;

export default async function RecipientPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: surprise, error } = await supabase
    .from("surprises").select("*").eq("unique_slug", params.slug).single();

  if (error || !surprise) {
    return <RecipientClient surprise={null} balloons={[]} errorType="not_found" />;
  }

  if (surprise.status !== "active" || (surprise.expires_at && new Date(surprise.expires_at) < new Date())) {
    return <RecipientClient surprise={null} balloons={[]} errorType="expired" />;
  }

  const { data: balloons } = await supabase
    .from("balloons").select("*").eq("surprise_id", surprise.id).order("order_index");

  return <RecipientClient surprise={surprise} balloons={balloons ?? []} errorType={null} />;
}