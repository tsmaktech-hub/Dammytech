import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Redirect login and signup to home on direct server requests (reloads)
  // This handles the user's request to go to home on reload instead of 404
  app.use((req, res, next) => {
    const path = req.path.toLowerCase();
    console.log(`[Server] Request path: ${path}`);
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
