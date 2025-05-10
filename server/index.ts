import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const PORT = process.env.PORT || 8081;

// 응답 로깅 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    } else {
      // 정적 파일 요청도 로깅
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// MIME 타입 설정을 위한 미들웨어
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(...args) {
    // JavaScript 파일에 대한 MIME 타입 설정
    if (req.path.endsWith('.js') || req.path.endsWith('.mjs')) {
      res.set('Content-Type', 'application/javascript');
    } else if (req.path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
    return originalSend.apply(res, args);
  };
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // 에러 핸들링 미들웨어
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error("서버 오류:", err);
  });

  // 개발 환경과 프로덕션 환경 분리
  if (app.get("env") === "development") {
    console.log("개발 모드에서 Vite 설정 중...");
    await setupVite(app, server);
  } else {
    console.log("프로덕션 모드에서 정적 파일 서빙 설정 중...");
    serveStatic(app);
  }

  // 서버 시작
  app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
    console.log(`환경: ${app.get("env")}`);
  });
})().catch(err => {
  console.error("서버 시작 실패:", err);
  process.exit(1);
});