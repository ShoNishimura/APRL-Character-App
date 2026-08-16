import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateWithOpenAI } from './openai-provider.mjs';
import { getPublicDesign, getRunSpec } from './study-design.mjs';
import { assertAndIncrementDailyLimit, getCached, makeCacheKey, setCached } from './storage.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const publicDir = path.join(root, 'public');

await loadEnvFile(path.join(root, '.env'));

const port = Number(process.env.PORT ?? 8787);
const model = process.env.OPENAI_MODEL ?? 'gpt-5.6-luna';
const maxDailyCalls = Math.max(1, Number(process.env.MAX_DAILY_LIVE_CALLS ?? 30));
const appVersion = 'mvp-v0.1-3lens';

const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml'
};

async function loadEnvFile(file) {
  try {
    const text = await readFile(file, 'utf8');
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const equals = line.indexOf('=');
      if (equals < 1) continue;
      const key = line.slice(0, equals).trim();
      let value = line.slice(equals + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env is optional until a live API call is requested.
  }
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store' });
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16 * 1024) throw new Error('request too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function validateRunRequest(input) {
  if (!input || typeof input !== 'object') throw new Error('requestが不正です。');
  if (typeof input.lensId !== 'string' || typeof input.scenarioId !== 'string') throw new Error('Lens / Situationが不正です。');
  if (input.variantId != null && typeof input.variantId !== 'string') throw new Error('比較軸が不正です。');
  return getRunSpec(input);
}

async function handleRun(req, res) {
  try {
    const runSpec = validateRunRequest(await readJsonBody(req));
    const cacheKey = makeCacheKey({ version: appVersion, model, runSpec });
    const cached = await getCached(cacheKey);
    if (cached) return sendJson(res, 200, { ...publicRunMetadata(runSpec), ...cached, cacheHit: true });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return sendJson(res, 503, { error: 'OPENAI_API_KEYが未設定です。.env.exampleを.envへコピーしてAPIキーを設定してください。' });

    await assertAndIncrementDailyLimit(maxDailyCalls);
    const generated = await generateWithOpenAI({ apiKey, model, runSpec });
    await setCached(cacheKey, generated);
    return sendJson(res, 200, { ...publicRunMetadata(runSpec), ...generated, cacheHit: false });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : '予期しないエラーが発生しました。';
    const status = /未知|不正|request too large/.test(message) ? 400 : 500;
    return sendJson(res, status, { error: message });
  }
}

function publicRunMetadata(runSpec) {
  return {
    lensId: runSpec.lensId,
    variantId: runSpec.variantId,
    scenario: runSpec.scenario,
    conditions: runSpec.conditions.map(({ id, publicLabel }) => ({ id, publicLabel })),
    identificationQuestion: runSpec.identificationQuestion,
    expectedConditionId: runSpec.expectedConditionId
  };
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  const relative = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const resolved = path.resolve(publicDir, relative);
  if (!resolved.startsWith(publicDir + path.sep) && resolved !== path.join(publicDir, 'index.html')) { res.writeHead(403); return res.end('Forbidden'); }
  try {
    const body = await readFile(resolved);
    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(resolved)] ?? 'application/octet-stream', 'Content-Length': body.length });
    if (req.method === 'HEAD') return res.end();
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') return sendJson(res, 200, { ok: true, appVersion, model, maxDailyCalls, apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY) });
  if (req.method === 'GET' && req.url === '/api/design') return sendJson(res, 200, getPublicDesign());
  if (req.method === 'POST' && req.url === '/api/run') return handleRun(req, res);
  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res);
  res.writeHead(405); res.end('Method not allowed');
});

server.listen(port, '127.0.0.1', () => {
  console.log(`APRL Character App: http://127.0.0.1:${port}`);
  console.log(`Model: ${model} / daily live-call cap: ${maxDailyCalls}`);
});
