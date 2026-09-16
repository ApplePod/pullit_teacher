import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FavItemsClient } from "./FavItemsClient";

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireUser();
  const { id = "" } = await searchParams;
  const supabase = await createClient();
  const { data: folder } = await supabase.from("favorite_folder").select("id,name").eq("id", id).maybeSingle();
  const { data: units } = await supabase.from("unit").select("code,subject,large_name,middle_name,ord").order("ord");
  if (!folder) return <div style={{ padding: 24 }}>폴더를 찾을 수 없습니다.</div>;
  return <FavItemsClient folderId={folder.id} folderName={folder.name} units={units ?? []} />;
}
