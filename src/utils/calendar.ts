export interface CalendarEvent {
  title: string;
  start: Date;
  /** 일정 길이(분). 기본 120분 */
  durationMinutes?: number;
  location?: string;
  description?: string;
}

/** Date → UTC 형식 문자열 (예: 20261025T050000Z) */
const toUtcStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const getRange = ({ start, durationMinutes = 120 }: CalendarEvent) => ({
  startStamp: toUtcStamp(start),
  endStamp: toUtcStamp(new Date(start.getTime() + durationMinutes * 60000)),
});

/** ICS 텍스트 값 이스케이프 */
const escapeIcs = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** 이벤트를 .ics(iCalendar) 텍스트로 변환 */
function buildIcs(event: CalendarEvent): string {
  const { startStamp, endStamp } = getRange(event);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//wedding-invite//KO",
    "BEGIN:VEVENT",
    `UID:${startStamp}@wedding-invite`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${startStamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(event.location ?? "")}`,
    `DESCRIPTION:${escapeIcs(event.description ?? "")}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:결혼식 하루 전입니다",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** PC 등 그 외 환경: .ics 파일 다운로드 */
function downloadIcs(ics: string) {
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "wedding.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 기기 기본 캘린더에 일정 추가
 * - Android: 캘린더 앱의 일정 추가 화면을 바로 실행 (파일 다운로드 없음)
 * - iOS: 캘린더 추가 시트를 바로 표시 (Safari)
 * - 그 외(PC 등): .ics 다운로드
 */
export function addToDeviceCalendar(event: CalendarEvent) {
  const ua = navigator.userAgent;
  const { durationMinutes = 120 } = event;

  if (/Android/i.test(ua)) {
    const begin = event.start.getTime();
    const extras = [
      `S.title=${encodeURIComponent(event.title)}`,
      `S.eventLocation=${encodeURIComponent(event.location ?? "")}`,
      `S.description=${encodeURIComponent(event.description ?? "")}`,
      `l.beginTime=${begin}`,
      `l.endTime=${begin + durationMinutes * 60000}`,
    ].join(";");
    window.location.href = `intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/event;${extras};end`;
    return;
  }

  const ics = buildIcs(event);
  if (/iPhone|iPad|iPod/i.test(ua)) {
    window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
    return;
  }
  downloadIcs(ics);
}
