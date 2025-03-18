/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",  // 모든 컴포넌트 포함
    "./screens/**/*.{js,jsx,ts,tsx}",     // 있다면 screens 폴더도 포함
    "./navigation/**/*.{js,jsx,ts,tsx}"   // 있다면 navigation 폴더도 포함
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}