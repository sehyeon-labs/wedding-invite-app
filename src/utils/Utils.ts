/**
 * ISO 날짜 문자열을 받아 예쁘게 포맷팅해주는 함수
 * 예: "2026-10-25T14:00:00" -> "2026년 10월 25일 일요일 오후 2시"
 */
export function formatWeddingDate(dateString: string): string {
  const dateObj = new Date(dateString);
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  // 요일 구하기
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDay = days[dateObj.getDay()];

  // 시간 구하기 (오전/오후)
  const hours = dateObj.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${year}년 ${month}월 ${day}일 ${weekDay}요일 ${period} ${formattedHours}시`;
}

/**
 * 클립보드에 텍스트 복사하는 공용 유틸리티
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