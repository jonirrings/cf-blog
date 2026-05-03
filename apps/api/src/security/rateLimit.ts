/**
 * 速率限制模块
 *
 * 功能：
 * - 基于 IP 的速率限制
 * - 基于用户的速率限制
 * - 不同端点的不同限制策略
 * - Cloudflare Workers 适配
 */

// 速率限制配置
export interface RateLimitConfig {
  interval: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
}

// 预定义的限制策略
export const RateLimitPresets = {
  // API 通用：100 次/分钟
  api: { interval: 60000, maxRequests: 100 },
  // 认证相关：10 次/分钟
  auth: { interval: 60000, maxRequests: 10 },
  // 评论：10 次/小时
  comment: { interval: 3600000, maxRequests: 10 },
  // 上传：20 次/小时
  upload: { interval: 3600000, maxRequests: 20 },
  // 严格限制：5 次/分钟（敏感操作）
  strict: { interval: 60000, maxRequests: 5 },
};

/**
 * 从请求中获取 IP 地址
 */
export function getClientIP(request: Request): string {
  // Cloudflare Workers 环境
  const cf = (request as any).cf;
  if (cf?.clientIp) {
    return cf.clientIp;
  }

  // 从 Header 获取
  const headers = ['x-forwarded-for', 'x-real-ip', 'true-client-ip', 'x-client-ip'];

  for (const header of headers) {
    const ip = request.headers.get(header);
    if (ip) {
      return ip.split(',')[0].trim();
    }
  }

  return 'unknown';
}

/**
 * 生成速率限制的 Key
 */
function getRateLimitKey(identifier: string, endpoint: string): string {
  return `ratelimit:${endpoint}:${identifier}`;
}

/**
 * 检查是否超过速率限制
 */
export async function checkRateLimit(
  kv: KVNamespace,
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = getRateLimitKey(identifier, endpoint);
  const now = Date.now();
  const windowStart = now - config.interval;

  // 获取当前窗口内的请求记录
  const data = await kv.get(key);
  let requests: number[] = [];

  if (data) {
    requests = JSON.parse(data);
    // 过滤掉窗口外的请求
    requests = requests.filter((timestamp) => timestamp > windowStart);
  }

  // 检查是否超过限制
  if (requests.length >= config.maxRequests) {
    const oldestRequest = requests[0];
    const resetAt = oldestRequest + config.interval;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // 添加当前请求
  requests.push(now);

  // 更新 KV（设置过期时间为窗口大小 + 缓冲）
  await kv.put(key, JSON.stringify(requests), {
    expirationTtl: Math.ceil(config.interval / 1000) + 60,
  });

  return {
    allowed: true,
    remaining: config.maxRequests - requests.length,
    resetAt: now + config.interval,
  };
}

/**
 * 速率限制中间件（Hono）
 */
export function rateLimitMiddleware(
  kv: KVNamespace,
  config: RateLimitConfig = RateLimitPresets.api
) {
  return async (c: any, next: any) => {
    const ip = getClientIP(c.req.raw);
    const endpoint = c.req.path;

    const result = await checkRateLimit(kv, ip, endpoint, config);

    // 添加响应头
    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', result.remaining.toString());
    c.header('X-RateLimit-Reset', Math.floor(result.resetAt / 1000).toString());

    if (!result.allowed) {
      return c.json(
        {
          success: false,
          error: 'Too Many Requests',
          message: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        429
      );
    }

    await next();
  };
}

/**
 * 基于用户的速率限制（需要登录）
 */
export async function checkUserRateLimit(
  kv: KVNamespace,
  userId: number,
  endpoint: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  return checkRateLimit(kv, `user:${userId}`, endpoint, config);
}
