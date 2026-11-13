import { supabase } from "@/lib/supabase";
import { formatShareDate, stripSurname } from "@/utils/format";

export interface ShareInfo {
  title: string;
  description: string;
  groomName: string;
  brideName: string;
}

/** 카카오 공유 / 링크 미리보기 카드에서 공통으로 사용하는 제목·설명을 만듭니다. */
export async function fetchShareInfo(): Promise<ShareInfo> {
  let groomName = "신랑";
  let brideName = "신부";
  let date = "날짜 미정";
  let location = "장소 미정";

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, wedding_date, location_name, location_detail_address")
    .limit(1)
    .maybeSingle();

  if (wedding) {
    if (wedding.wedding_date) date = formatShareDate(wedding.wedding_date);
    const place = [wedding.location_name, wedding.location_detail_address].filter(Boolean).join(" ");
    if (place) location = place;

    const { data: family } = await supabase
      .from("wedding_family_members")
      .select("role_type, name")
      .eq("wedding_id", wedding.id)
      .in("role_type", ["groom", "bride"]);

    const groom = family?.find((m) => m.role_type === "groom")?.name;
    const bride = family?.find((m) => m.role_type === "bride")?.name;
    if (groom) groomName = stripSurname(groom);
    if (bride) brideName = stripSurname(bride);
  }

  return {
    title: `${groomName}와 ${brideName}의 결혼식에 초대합니다`,
    description: `${date} ${location}`,
    groomName,
    brideName,
  };
}
