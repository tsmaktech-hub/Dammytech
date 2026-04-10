import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase with Service Role Key (Server-side only)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://esqukfrytkoiwbagfqsn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is not set. Database operations might fail.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      supabaseUrl: supabaseUrl ? "Set" : "Missing",
      supabaseKey: supabaseServiceKey ? "Set" : "Missing"
    });
  });

  // API Routes
  app.get("/api/gadgets", async (req, res) => {
    console.log("[Server] Fetching gadgets...");
    try {
      const { data, error } = await supabaseAdmin
        .from("gadgets")
        .select(`
          *,
          author:profiles(*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Server] Supabase error fetching gadgets:", error);
        throw error;
      }
      res.json(data);
    } catch (error: any) {
      console.error("[Server] Catch error fetching gadgets:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gadgets", async (req, res) => {
    console.log("[Server] POST /api/gadgets - Body:", JSON.stringify(req.body, null, 2));
    try {
      const gadget = req.body;
      
      if (!supabaseServiceKey) {
        console.error("[Server] ERROR: SUPABASE_SERVICE_ROLE_KEY is missing!");
        return res.status(500).json({ error: "Server configuration error: Missing API Key" });
      }

      const { data, error } = await supabaseAdmin
        .from("gadgets")
        .insert([gadget])
        .select();

      if (error) {
        console.error("[Server] Supabase INSERT error:", JSON.stringify(error, null, 2));
        return res.status(400).json({ error: error.message, details: error });
      }

      console.log("[Server] Gadget created successfully:", JSON.stringify(data[0], null, 2));
      res.json(data[0]);
    } catch (error: any) {
      console.error("[Server] Unexpected catch error:", error);
      res.status(500).json({ error: error.message || "An unexpected server error occurred" });
    }
  });

  app.put("/api/gadgets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { data, error } = await supabaseAdmin
        .from("gadgets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/gadgets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from("gadgets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Log requests for debugging
  app.use((req, res, next) => {
    const path = req.path.toLowerCase();
    // Skip logging for static assets to reduce noise
    if (!path.includes('.') || path.endsWith('.html')) {
      console.log(`[Server] Incoming request: ${path}`);
    }
    
    if (path === '/login' || path === '/signup' || path === '/login/' || path === '/signup/') {
      console.log(`[Server] Redirecting ${path} to /`);
      return res.redirect('/');
    }
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // This handles the SPA fallback in development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let template = await fs.readFile(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
