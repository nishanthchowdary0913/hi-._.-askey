import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());

function runRag(request: { message: string; category?: string }) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const projectRoot = path.resolve(__dirname, '..');
    const localPython = process.platform === 'win32'
      ? path.join(projectRoot, '.venv312', 'Scripts', 'python.exe')
      : 'python3';
    const python = process.env.PYTHON || localPython;
    const ragScript = path.join(__dirname, 'rag_api.py');
    const child = spawn(python, [ragScript], { cwd: projectRoot, windowsHide: true });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `RAG process exited with code ${code}`));
        return;
      }
      try { resolve(JSON.parse(stdout)); }
      catch { reject(new Error(`Invalid RAG response: ${stdout}`)); }
    });
    child.stdin.end(JSON.stringify(request));
  });
}

app.post('/api/chat', async (req, res) => {
  const { message, category } = req.body as { message?: string; category?: string };
  if (!message?.trim()) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }
  try {
    res.json(await runRag({ message: message.trim(), category }));
  } catch (error) {
    console.error('RAG request failed:', error);
    res.status(503).json({ error: 'The knowledge engine is unavailable.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Hi Askey' }));

async function start() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => console.log(`Hi Askey running at http://localhost:${port}`));
}

start();
