import { initKakao } from "@/lib/kakao";
import type { CalendarEvent } from "@/utils/calendar";

const CALLBACK_STATE = "kakao-calendar";
const TOKEN_URL = "https://kauth.kakao.com/oauth/token";

/** 카카오톡 인앱 브라우저 여부 */
export const isKakaoInApp = () => typeof navigator !== "undefined" && /KAKAOTALK/i.test(navigator.userAgent);

const getRedirectUri = () => `${window.location.origin}${window.location.pathname}`;

/** 카카오 로그인/동의 화면으로 이동 (톡캘린더 일정 생성 권한). SDK를 쓸 수 없으면 false */
export function startKakaoCalendarAuth(): boolean {
  if (!initKakao()) return false;
  window.Kakao.Auth.authorize({ redirectUri: getRedirectUri(), scope: "talk_calendar", state: CALLBACK_STATE });
  return true;
}

/** 로그인 후 돌아온 주소에서 인가 코드/에러를 읽음. 해당 흐름이 아니면 null */
export function readKakaoCalendarCallback(): { code?: string; error?: string } | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get("state") !== CALLBACK_STATE) return null;
  return { code: params.get("code") ?? undefined, error: params.get("error") ?? undefined };
}

/** UTC ISO 문자열 (밀리초 제외) */
const toIso = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, "Z");

/** 인가 코드를 토큰으로 교환한 뒤 톡캘린더 기본 캘린더에 일정을 생성 */
export async function saveEventToTalkCalendar(code: string, event: CalendarEvent): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || "";

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, redirect_uri: getRedirectUri(), code }),
  });
  const token = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(token.error_description || token.error || "토큰 발급 실패");

  initKakao();
  window.Kakao.Auth.setAccessToken(token.access_token);

  const { durationMinutes = 120 } = event;
  await window.Kakao.API.request({
    url: "/v2/api/calendar/create/event",
    data: {
      calendar_id: "primary",
      event: JSON.stringify({
        title: event.title,
        time: {
          start_at: toIso(event.start),
          end_at: toIso(new Date(event.start.getTime() + durationMinutes * 60000)),
          time_zone: "Asia/Seoul",
          all_day: false,
          lunar: false,
        },
        description: event.description,
        location: event.location ? { name: event.location } : undefined,
        reminders: [1440],
      }),
    },
  });
}
