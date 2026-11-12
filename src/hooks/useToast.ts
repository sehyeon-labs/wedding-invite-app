import { useState, useRef, useCallback, useEffect } from "react";

/** 토스트 메시지 표시 상태를 관리하는 훅 (기본 2초 후 자동 숨김) */
export function useToast(duration = 2000) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(text);
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), duration);
    },
    [duration]
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { message, visible, showToast };
}
