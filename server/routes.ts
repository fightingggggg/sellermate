import type { Express } from "express";
import { createServer, type Server } from "https";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "./ssl/server.key")),
    cert: fs.readFileSync(path.join(__dirname, "./ssl/server.cert")),
  };
  // API Endpoint to check server status
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', message: 'SEO Dashboard API is running' });
  });

  // API Endpoint for Chrome extension to communicate with server
  app.post('/api/analyze-query', (req, res) => {
    const { query, email } = req.body;
    
    if (!query || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Query and email are required' 
      });
    }
    
    // In a real implementation, this would analyze the query and return results
    // For now, we'll just return a success message
    res.json({ 
      success: true, 
      message: 'Query analysis request received', 
      query, 
      email 
    });
  });

  // ✅ HTTPS 서버 생성 (반환)
  const httpsServer = createServer(httpsOptions, app);
  return httpsServer;
}
