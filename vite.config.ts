import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Typing-practice-app/', // 저장소 이름 앞뒤로 슬래시(/) 필수!
})
