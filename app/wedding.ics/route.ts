import { supabase } from "@/lib/supabase";
import { buildIcs, buildWeddingEvent } from "@/utils/calendar";

// 정적 export 빌드 시점에 /wedding.ics 파일로 생성됩니다. (iOS 캘린더 추가용)
export const dynamic = "force-static";

/** 결혼식 일정을 담은 .ics 파일 응답 */
export async function GET() {
  let body = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//wedding-invite//KO\r\nEND:VCALENDAR";

  try {
    const { data: wedding } = await supabase
      .from("weddings")
      .select("id, wedding_date, location_name, location_address")
      .limit(1)
      .maybeSingle();

    if (wedding?.wedding_date) {
      const { data: members } = await supabase
        .from("wedding_family_members")
        .select("role_type, name")
        .eq("wedding_id", wedding.id)
        .in("role_type", ["groom", "bride"]);

      body = buildIcs(
        buildWeddingEvent({
          groomName: members?.find((m) => m.role_type === "groom")?.name || "신랑",
          brideName: members?.find((m) => m.role_type === "bride")?.name || "신부",
          weddingDate: wedding.wedding_date,
          locationName: [wedding.location_name, wedding.location_address].filter(Boolean).join(" · "),
        })
      );
    }
  } catch (error) {
    console.error("ics 생성 실패:", error);
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="wedding.ics"',
    },
  });
}
