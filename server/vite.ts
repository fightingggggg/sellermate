import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: ["localhost"]
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // API 경로는 처리하지 않음
    if (url.startsWith('/api')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // 빌드 경로 확인 - 실제 빌드된 위치를 정확히 찾아야 함
  const distPath = path.resolve(import.meta.dirname, "..", "dist/public");
  
  console.log(`정적 파일 서빙 경로: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    console.error(`빌드 디렉토리가 존재하지 않습니다: ${distPath}`);
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // JS 파일에 대한 MIME 타입을 명시적으로 설정
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
      // 캐시 제어 추가
      res.setHeader('Cache-Control', 'no-cache');
    }
  }));

  // API 경로를 제외한 모든 요청을 SPA의 index.html로 리다이렉션
  app.get('*', (req, res, next) => {
    // API 요청은 express 라우터가 처리하도록 next() 호출
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    console.log(`SPA 경로 처리: ${req.path} -> index.html`);
    
    // index.html이 존재하는지 확인
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    } else {
      console.error(`index.html을 찾을 수 없습니다: ${indexPath}`);
      return res.status(404).send('Application not found');
    }
  });
}