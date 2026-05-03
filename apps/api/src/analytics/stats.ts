/**
 * 访问统计分析
 *
 * 功能：
 * - 访问趋势分析（按小时/天/周）
 * - 来源分析（Referer）
 * - 热门页面排名
 */

import type { KVNamespace } from "@cloudflare/workers-types";

export interface TimeSeriesData {
  timestamp: number;
  count: number;
}

export interface RefererStats {
  referer: string;
  count: number;
}

export interface PageRank {
  postId: string;
  count: number;
}

/**
 * 获取小时 Key
 */
function getHourKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `stats:hour:${date.toISOString().slice(0, 13)}`; // YYYY-MM-DDTHH
}

/**
 * 获取天 Key
 */
function getDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `stats:day:${date.toISOString().slice(0, 10)}`; // YYYY-MM-DD
}

/**
 * 获取来源统计 Key
 */
function getRefererKey(postId: string): string {
  return `stats:referer:${postId}`;
}

/**
 * 记录访问时间（用于趋势分析）
 */
export async function recordAccessTime(
  kv: KVNamespace,
  postId: string,
  referer?: string,
): Promise<void> {
  const now = Date.now();
  const hourKey = getHourKey(now);
  const dayKey = getDayKey(now);

  // 记录小时级统计
  const hourData = await kv.get(hourKey);
  const hourCount = hourData ? parseInt(hourData, 10) : 0;
  await kv.put(hourKey, (hourCount + 1).toString(), { expirationTtl: 7 * 24 * 60 * 60 });

  // 记录天级统计
  const dayData = await kv.get(dayKey);
  const dayCount = dayData ? parseInt(dayData, 10) : 0;
  await kv.put(dayKey, (dayCount + 1).toString(), { expirationTtl: 30 * 24 * 60 * 60 });

  // 记录来源统计
  if (referer) {
    const refererKey = getRefererKey(postId);
    const refererData = await kv.get(refererKey);
    const refererCounts: Record<string, number> = refererData ? JSON.parse(refererData) : {};
    refererCounts[referer] = (refererCounts[referer] || 0) + 1;
    await kv.put(refererKey, JSON.stringify(refererCounts), { expirationTtl: 7 * 24 * 60 * 60 });
  }
}

/**
 * 获取访问趋势（按小时）
 */
export async function getHourlyTrend(
  kv: KVNamespace,
  hours: number = 24,
): Promise<TimeSeriesData[]> {
  const result: TimeSeriesData[] = [];
  const now = Date.now();

  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = now - i * 60 * 60 * 1000;
    const key = getHourKey(timestamp);
    const data = await kv.get(key);
    const count = data ? parseInt(data, 10) : 0;

    result.push({
      timestamp,
      count,
    });
  }

  return result;
}

/**
 * 获取访问趋势（按天）
 */
export async function getDailyTrend(kv: KVNamespace, days: number = 7): Promise<TimeSeriesData[]> {
  const result: TimeSeriesData[] = [];
  const now = Date.now();

  for (let i = days - 1; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const key = getDayKey(timestamp);
    const data = await kv.get(key);
    const count = data ? parseInt(data, 10) : 0;

    result.push({
      timestamp,
      count,
    });
  }

  return result;
}

/**
 * 获取来源统计
 */
export async function getRefererStats(kv: KVNamespace, postId: string): Promise<RefererStats[]> {
  const key = getRefererKey(postId);
  const data = await kv.get(key);
  if (!data) {
    return [];
  }

  const refererCounts: Record<string, number> = JSON.parse(data);
  return Object.entries(refererCounts)
    .map(([referer, count]) => ({ referer, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 获取热门页面排名
 */
export async function getTopPages(kv: KVNamespace, limit: number = 10): Promise<PageRank[]> {
  const allKeys = await kv.list({ prefix: "visit_count:" });
  const counts: PageRank[] = [];

  for (const key of allKeys.keys) {
    const data = await kv.get(key.name);
    if (data) {
      const visitCount = JSON.parse(data) as { postId: string; count: number };
      counts.push({
        postId: visitCount.postId,
        count: visitCount.count,
      });
    }
  }

  return counts.sort((a, b) => b.count - a.count).slice(0, limit);
}
