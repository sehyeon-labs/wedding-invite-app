// src/utils/format.ts

/**
 * ISO 날짜 문자열을 받아 국문 전체 웨딩 일시 포맷으로 변환합니다.
 * @param dateString - ISO 형식의 날짜 문자열 (예: "2026-10-25T14:00:00")
 * @returns 포맷된 문자열 (예: "2026년 10월 25일 일요일 오후 2시")
 */
export function formatWeddingDate(dateString: string): string {
  const dateObj = new Date(dateString);
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDay = days[dateObj.getDay()];

  const hours = dateObj.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${year}년 ${month}월 ${day}일 ${weekDay}요일 ${period} ${formattedHours}시`;
}

/**
 * ISO 날짜 문자열을 받아 국문 날짜(년, 월, 일, 요일) 포맷으로 변환합니다.
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 포맷된 날짜 문자열 (예: "2026년 10월 25일 일요일")
 */
export function formatDay(dateString: string): string {
  const dateObj = new Date(dateString);
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDay = days[dateObj.getDay()];

  return `${year}년 ${month}월 ${day}일 ${weekDay}요일`;
}

/**
 * ISO 날짜 문자열을 받아 국문 시간(오전/오후, 시, 분) 포맷으로 변환합니다.
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 포맷된 시간 문자열 (예: "오후 2시 00분")
 */
export function formatTime(dateString: string): string {
  const dateObj = new Date(dateString);

  const hours = dateObj.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = dateObj.getMinutes().toString().padStart(2, "0");

  return `${period} ${formattedHours}시 ${formattedMinutes}분`;
}

/**
 * ISO 날짜 문자열을 받아 커버 화면용 영문 날짜 포맷으로 변환합니다.
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 포맷된 영문 날짜 (예: "October 25, 2027")
 */
export function formatCoverDate(dateString: string): string {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * ISO 날짜 문자열을 받아 커버 화면용 영문 요일 및 시간 포맷으로 변환합니다.
 * @param dateString - ISO 형식의 날짜 문자열
 * @returns 포맷된 영문 시간 (예: "Sunday, PM 12:00")
 */
export function formatCoverTime(dateString: string): string {
  const dateObj = new Date(dateString);
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${weekday}, ${timeStr}`;
}

/**
 * 주어진 텍스트를 클립보드에 복사합니다.
 * @param text - 복사할 문자열
 * @returns 복사 성공 여부 (Promise<boolean>)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("클립보드 복사 실패:", error);
    return false;
  }
}