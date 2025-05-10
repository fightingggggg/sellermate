import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // 모듈 타입 문제를 해결하기 위한 설정
    rollupOptions: {
      output: {
        // 청크 파일 이름 포맷 변경 - 해시 포함
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        // ESM 모듈 형식으로 출력
        format: 'es'
      },
    },
    // 최신 브라우저 타겟팅
    target: 'es2020',
    // 소스맵 제공
    sourcemap: true,
    // 청크 크기 경고 임계값 증가 
    chunkSizeWarningLimit: 1000
  },
  // 배포 시에도 개발 모드 기능 유지
  esbuild: {
    pure: process.env.NODE_ENV === 'production' ? ['console.log'] : []
  }
});