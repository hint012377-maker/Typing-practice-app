import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // (React 기준)

export default defineConfig({
  plugins: [react()],
  base: '/Typing-practice-app/', // 저장소(Repo) 이름과 똑같이 작성 (앞뒤 슬래시 필수)
})
