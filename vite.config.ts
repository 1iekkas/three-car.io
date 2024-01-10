import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
      	// 在这里修改静态资源路径
        chunkFileNames: 'static/assets/js/[name]-[hash].js',
        entryFileNames: 'static/assets/js/[name]-[hash].js',
        assetFileNames: 'static/assets/[ext]/[name]-[hash].[ext]',
      }
    }
  },
  base: './', // 这里更改打包相对绝对路径
  minify: true, // 是否压缩代码
  sourceMap: true, // 是否生成sourceMap
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
