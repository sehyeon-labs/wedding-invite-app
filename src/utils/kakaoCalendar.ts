import type { CalendarEvent } from "@/utils/calendar";

const CALLBACK_STATE = "kakao-calendar";
const TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const CREATE_EVENT_URL = "https://kapi.kakao.com/v2/api/calendar/create/event";

/** 카카오톡 인앱 브라우저 여부 */
export const isKakaoInApp = () =>
  typeof navigator !== "undefined" && /KAKAOTALK/i.test(navigator.userAgent);

const getRedirectUri = () =>
  `${window.location.origin}${window.location.pathname}`;

/** 인가 코드 발급과 토큰 발급에 같은 키(client_id)를 써야 하므로 한 곳에서 결정 */
const getClientId = () => process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || "";

/** 카카오 로그인/동의 화면으로 이동 (톡캘린더 일정 생성 권한). 키가 없으면 false */
export function startKakaoCalendarAuth(): boolean {
  const clientId = getClientId();
  if (!clientId) return false;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "talk_calendar",
    state: CALLBACK_STATE,
  });
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  return true;
}

/** 로그인 후 돌아온 주소에서 인가 코드/에러를 읽음. 해당 흐름이 아니면 null */
export function readKakaoCalendarCallback(): {
  code?: string;
  error?: string;
} | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get("state") !== CALLBACK_STATE) return null;
  return {
    code: params.get("code") ?? undefined,
    error: params.get("error") ?? undefined,
  };
}

/** UTC ISO 문자열 (밀리초 제외) */
const toIso = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, "Z");

/** 인가 코드를 토큰으로 교환한 뒤 톡캘린더 기본 캘린더에 일정을 생성 */
export async function saveEventToTalkCalendar(
  code: string,
  event: CalendarEvent,
): Promise<void> {
  const clientId = getClientId();

  let token;
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: getRedirectUri(),
        code,
      }),
    });
    token = await tokenRes.json();
    if (!tokenRes.ok)
      throw new Error(
        `${token.error_code ?? token.error ?? "error"} ${token.error_description ?? ""}`,
      );
  } catch (error) {
    throw new Error(
      `토큰 발급 실패 - ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const { durationMinutes = 120 } = event;
  const eventBody = {
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
  };

  try {
    const res = await fetch(CREATE_EVENT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({ calendar_id: "primary", event: JSON.stringify(eventBody) }),
    });
    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      throw new Error(`${result.code ?? res.status} ${result.msg ?? ""}`);
    }
  } catch (error) {
    throw new Error(`일정 생성 실패 - ${error instanceof Error ? error.message : String(error)}`);
  }
}
