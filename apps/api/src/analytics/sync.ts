/**
 * Cloudflare Analytics API 同步校准
 *
 * 功能：
 * - 从 Cloudflare Analytics API 拉取真实数据
 * - 与本地计数对比校准
 * - 定时同步任务
 */

// Use a compatible KVNamespace type to avoid type mismatch between different workers-types versions
type KVNamespace = {
  get(key: string, options?: Partial<KVNamespaceGetOptions<undefined>>): Promise<string | null>;
  get(key: string, type: 'text'): Promise<string | null>;
  get(key: string, type: 'json'): Promise<unknown>;
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer>;
  get(key: string, type: 'stream'): Promise<ReadableStream>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string; expiration?: number; metadata?: unknown }>;
    list_complete: boolean;
    cursor?: string;
  }>;
  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer,
    options?: { expirationTtl?: number; expiration?: number; metadata?: unknown }
  ): Promise<void>;
  delete(key: string): Promise<void>;
};

export interface CloudflareAnalyticsResponse {
  success: boolean;
  errors: any[];
  messages: any[];
  result: {
    data: {
      sum?: { requests?: number };
      dimensions?: {
        datetime?: string;
        url?: string;
        clientRequestPath?: string;
      }[];
    }[];
  };
}

export interface SyncResult {
  synced: boolean;
  localCount: number;
  cloudflareCount: number;
  difference: number;
}

/**
 * 从 Cloudflare Analytics API 获取页面访问数据
 */
export async function fetchCloudflareAnalytics(
  apiToken: string,
  accountId: string,
  zoneId: string,
  since: string,
  until: string
): Promise<CloudflareAnalyticsResponse | null> {
  const url = `https://api.cloudflare.com/client/v4/graphql`;

  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${zoneId}" }) {
          httpRequests1dGroups(
            limit: 1000,
            filter: {
              datetime_geq: "${since}",
              datetime_lt: "${until}"
            }
          ) {
            sum {
              requests
            }
            dimensions {
              datetime
              url
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error('Failed to fetch Cloudflare Analytics:', response.status);
      return null;
    }

    const data = (await response.json()) as CloudflareAnalyticsResponse;
    return data;
  } catch (error) {
    console.error('Error fetching Cloudflare Analytics:', error);
    return null;
  }
}

/**
 * 校准本地计数与 Cloudflare 数据
 */
export async function syncAnalytics(
  kv: KVNamespace,
  apiToken: string,
  accountId: string,
  zoneId: string,
  postId: string
): Promise<SyncResult> {
  const now = new Date();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 天前
  const until = now.toISOString();

  const analytics = await fetchCloudflareAnalytics(apiToken, accountId, zoneId, since, until);
  if (!analytics || !analytics.success) {
    return {
      synced: false,
      localCount: 0,
      cloudflareCount: 0,
      difference: 0,
    };
  }

  // 获取本地计数
  const localKey = `visit_count:${postId}`;
  const localData = await kv.get(localKey);
  const localCount = localData ? (JSON.parse(localData) as { count: number }).count : 0;

  // 从 Cloudflare 数据中提取该页面的访问数
  let cloudflareCount = 0;
  if (analytics.result?.data) {
    for (const group of analytics.result.data) {
      if (group.dimensions) {
        for (const dim of group.dimensions) {
          if (dim.url?.includes(postId)) {
            cloudflareCount += group.sum?.requests ?? 0;
          }
        }
      }
    }
  }

  const difference = cloudflareCount - localCount;

  // 如果差异超过 10%，更新本地计数
  if (Math.abs(difference) > localCount * 0.1 && difference > 0) {
    await kv.put(
      localKey,
      JSON.stringify({
        postId,
        count: cloudflareCount,
        lastUpdated: Date.now(),
      })
    );
  }

  return {
    synced: true,
    localCount,
    cloudflareCount,
    difference,
  };
}

/**
 * 批量同步多个页面
 */
export async function batchSyncAnalytics(
  kv: KVNamespace,
  apiToken: string,
  accountId: string,
  zoneId: string,
  postIds: string[]
): Promise<Map<string, SyncResult>> {
  const results = new Map<string, SyncResult>();

  for (const postId of postIds) {
    const result = await syncAnalytics(kv, apiToken, accountId, zoneId, postId);
    results.set(postId, result);
  }

  return results;
}
