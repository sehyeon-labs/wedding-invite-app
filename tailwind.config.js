// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          bg: "#FDFBF7",      // 따뜻한 아이보리 배경
          card: "#F4EFEA",    // 카드 영역 배경
          primary: "#3A322C", // 딥 브라운 (주요 텍스트)
          accent: "#8C5D55",  // 빈티지 로즈 (포인트)
          gold: "#C5A059",    // 앤틱 골드
          muted: "#8C857E",   // 서브 텍스트
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};