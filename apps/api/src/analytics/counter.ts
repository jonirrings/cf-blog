/**
 * 访问计数器
 *
 * 功能：
 * - 页面访问计数（去重）
 * - 防作弊机制（IP + User-Agent 指纹）
 * - 时间窗口去重（1 小时内同一用户只计 1 次）
 */

import type { KVNamespace } from '@cloudflare/workers-types';

export interface VisitRecord {
  postId: string;
  userId?: string;
  ipFingerprint: string;
  userAgent: string;
  timestamp: number;
}

export interface VisitCount {
  postId: string;
  count: number;
  lastUpdated: number;
}

/**
 * 生成用户指纹（IP + User-Agent 简化哈希）
 */
function generateFingerprint(ip: string, userAgent: string): string {
  const data = `${ip}|${userAgent}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * 获取访问计数 Key
 */
function getVisitCountKey(postId: string): string {
  return `visit_count:${postId}`;
}

/**
 * 获取访问记录 Key（用于去重）
 */
function getVisitRecordKey(postId: string, fingerprint: string): string {
  return `visit_record:${postId}:${fingerprint}`;
}

/**
 * 记录页面访问（去重）
 */
export async function recordVisit(
  kv: KVNamespace,
  postId: string,
  ip: string,
  userAgent: string,
  userId?: string
): Promise<{ recorded: boolean; count: number }> {
  const fingerprint = generateFingerprint(ip, userAgent);
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 小时去重窗口

  const recordKey = getVisitRecordKey(postId, fingerprint);
  const countKey = getVisitCountKey(postId);

  // 检查是否在去重窗口内
  const existingRecord = await kv.get(recordKey);
  if (existingRecord) {
    const record = JSON.parse(existingRecord) as VisitRecord;
    if (now - record.timestamp < windowMs) {
      // 在窗口内，不计数
      const countData = await kv.get(countKey);
      const count = countData ? (JSON.parse(countData) as VisitCount).count : 0;
      return { recorded: false, count };
    }
  }

  // 记录访问
  const visitRecord: VisitRecord = {
    postId,
    userId,
    ipFingerprint: fingerprint,
    userAgent,
    timestamp: now,
  };

  // 更新计数
  const countData = await kv.get(countKey);
  let visitCount: VisitCount;
  if (countData) {
    visitCount = JSON.parse(countData) as VisitCount;
    visitCount.count += 1;
    visitCount.lastUpdated = now;
  } else {
    visitCount = {
      postId,
      count: 1,
      lastUpdated: now,
    };
  }

  // 并行写入
  await Promise.all([
    kv.put(recordKey, JSON.stringify(visitRecord), { expirationTtl: 7 * 24 * 60 * 60 }), // 7 天
    kv.put(countKey, JSON.stringify(visitCount)),
  ]);

  return { recorded: true, count: visitCount.count };
}

/**
 * 获取页面访问计数
 */
export async function getVisitCount(kv: KVNamespace, postId: string): Promise<number> {
  const key = getVisitCountKey(postId);
  const data = await kv.get(key);
  if (!data) {
    return 0;
  }
  const count = JSON.parse(data) as VisitCount;
  return count.count;
}

/**
 * 批量获取多个页面的访问计数
 */
export async function getVisitCounts(
  kv: KVNamespace,
  postIds: string[]
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const keys = postIds.map((id) => getVisitCountKey(id));
  const values = await kv.get(keys);

  postIds.forEach((postId, index) => {
    const data = values[index];
    if (data) {
      const count = JSON.parse(data) as VisitCount;
      results.set(postId, count.count);
    } else {
      results.set(postId, 0);
    }
  });

  return results;
}

/**
 * 重置页面访问计数
 */
export async function resetVisitCount(kv: KVNamespace, postId: string): Promise<void> {
  const countKey = getVisitCountKey(postId);
  await kv.delete(countKey);
}
