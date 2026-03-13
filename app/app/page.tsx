import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppContent from "@/components/AppContent";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const rootPages = (pages ?? []).filter((p) => !p.parent_id);
  const childMap = (pages ?? []).reduce<Record<string, typeof pages>>(
    (acc, p) => {
      const pid = p.parent_id ?? "root";
      if (!acc[pid]) acc[pid] = [];
      acc[pid]!.push(p);
      return acc;
    },
    {}
  );

  const tree = rootPages.map((p) => ({
    ...p,
    children: (childMap[p.id] ?? []).map((c) => ({
      ...c,
      children: childMap[c.id] ?? [],
    })),
  }));

  return <AppContent initialPages={tree} />;
}
