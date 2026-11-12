/** 카카오 JS SDK 초기화 (이미 초기화된 경우 무시). 사용 가능하면 true */
export function initKakao(): boolean {
  if (typeof window === "undefined" || !window.Kakao) return false;
  const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
  if (!window.Kakao.isInitialized() && key) window.Kakao.init(key);
  return window.Kakao.isInitialized();
}
