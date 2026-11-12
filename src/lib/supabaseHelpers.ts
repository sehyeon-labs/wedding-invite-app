import { supabase } from "@/lib/supabase";

/** weddings 테이블의 첫 번째 행에서 지정한 컬럼을 조회합니다. 실패 시 예외를 던집니다. */
export async function fetchWedding<T>(columns: string): Promise<T | null> {
  const { data, error } = await supabase.from("weddings").select(columns).limit(1).single();
  if (error) throw error;
  return (data as unknown as T) ?? null;
}

/** Storage 폴더의 첫 번째 파일(placeholder 제외) 공개 URL을 반환합니다. 없으면 null. */
export async function getFirstStorageFileUrl(folder: string, bucket = "photos"): Promise<string | null> {
  const storage = supabase.storage.from(bucket);
  const { data, error } = await storage.list(folder, {
    limit: 5,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;

  const file = data?.find((f) => f.name !== ".emptyFolderPlaceholder");
  if (!file) return null;
  return storage.getPublicUrl(`${folder}/${file.name}`).data?.publicUrl ?? null;
}
