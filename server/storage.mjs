import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const cacheDir = path.resolve('.cache');
const responseCacheFile = path.join(cacheDir, 'responses.json');
const dailyUsageFile = path.join(cacheDir, 'daily-usage.json');

export function makeCacheKey(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export async function getCached(key) {
  const cache = await readJson(responseCacheFile, {});
  return cache[key] ?? null;
}

export async function setCached(key, value) {
  await mkdir(cacheDir, { recursive: true });
  const cache = await readJson(responseCacheFile, {});
  cache[key] = value;
  await writeFile(responseCacheFile, JSON.stringify(cache, null, 2), 'utf8');
}

function todayJst() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
}

export async function assertAndIncrementDailyLimit(limit) {
  const today = todayJst();
  const current = await readJson(dailyUsageFile, { date: today, count: 0 });
  const usage = current.date === today ? current : { date: today, count: 0 };

  if (usage.count >= limit) {
    throw new Error(`本日のlive API上限（${limit}回）に達しました。MAX_DAILY_LIVE_CALLSを変更するまで停止します。`);
  }

  const next = { date: today, count: usage.count + 1 };
  await mkdir(cacheDir, { recursive: true });
  await writeFile(dailyUsageFile, JSON.stringify(next, null, 2), 'utf8');
  return next.count;
}
