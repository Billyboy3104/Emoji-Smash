import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 'Emoji-Smash' // リポ名に合わせる
const isGH = process.env.GITHUB_PAGES === 'true'
const base = isGH ? `/${repoName}/` : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
