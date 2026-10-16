import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'

// site.json이 없어도 빌드가 깨지지 않도록 안전하게 처리
let siteConfiguration: any = {}
try {
  const sitePath = path.resolve(__dirname, './.figma/make/site.json')
  if (fs.existsSync(sitePath)) {
    siteConfiguration = JSON.parse(fs.readFileSync(sitePath, 'utf-8'))
  }
} catch {
  siteConfiguration = {}
}
