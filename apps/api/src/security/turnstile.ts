/**
 * Cloudflare Turnstile 人机验证模块
 *
 * 功能：
 * - 验证 Turnstile Token
 * - 生成 Turnstile 配置
 * - 验证结果处理
 */

// Turnstile 验证响应
export interface TurnstileResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
  action?: string;
  cdata?: string;
}

/**
 * 验证 Turnstile Token
 */
export async function verifyTurnstileToken(
  secretKey: string,
  token: string,
  remoteIp?: string
): Promise<{ valid: boolean; error?: string; response?: TurnstileResponse }> {
  try {
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    const body = new URLSearchParams({
      secret: secretKey,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = (await response.json()) as TurnstileResponse;

    if (!data.success) {
      return {
        valid: false,
        error: `Turnstile 验证失败：${data.error_codes?.join(', ') || '未知错误'}`,
      };
    }

    return { valid: true, response: data };
  } catch (error) {
    console.error('[Turnstile] 验证失败:', error);
    return {
      valid: false,
      error: 'Turnstile 服务不可用',
    };
  }
}

/**
 * 获取客户端 IP（用于 Turnstile 验证）
 */
export function getClientIP(request: Request): string | undefined {
  const cf = (request as any).cf;
  if (cf?.clientIp) {
    return cf.clientIp;
  }

  const headers = ['x-forwarded-for', 'x-real-ip', 'true-client-ip', 'x-client-ip'];

  for (const header of headers) {
    const ip = request.headers.get(header);
    if (ip) {
      return ip.split(',')[0].trim();
    }
  }

  return undefined;
}

/**
 * Turnstile 验证中间件
 */
export function turnstileMiddleware(
  secretKey: string,
  options: {
    requiredPaths?: string[];
    excludePaths?: string[];
  } = {}
) {
  const {
    requiredPaths = ['/api/auth', '/api/comments', '/api/users/publisher-apply'],
    excludePaths = [],
  } = options;

  return async (c: any, next: any) => {
    const path = c.req.path;
    const method = c.req.method;

    // 只对 POST 请求进行验证
    if (method !== 'POST') {
      await next();
      return;
    }

    // 检查是否在排除列表中
    if (excludePaths.some((p) => path.startsWith(p))) {
      await next();
      return;
    }

    // 检查是否需要验证
    const needsVerification = requiredPaths.some((p) => path.startsWith(p));
    if (!needsVerification) {
      await next();
      return;
    }

    // 从请求体中获取 Turnstile Token
    const body = await c.req.json().catch(() => ({}));
    const token = body['cf-turnstile-response'] || body['turnstileToken'];

    if (!token) {
      return c.json(
        {
          success: false,
          error: '人机验证失败',
          message: '请完成人机验证',
        },
        400
      );
    }

    // 验证 Token
    const ip = getClientIP(c.req.raw);
    const result = await verifyTurnstileToken(secretKey, token, ip);

    if (!result.valid) {
      return c.json(
        {
          success: false,
          error: '人机验证失败',
          message: result.error,
        },
        400
      );
    }

    // 验证通过，继续处理
    await next();
  };
}

/**
 * 生成 Turnstile 前端配置
 */
export function getTurnstileConfig(
  siteKey: string,
  options: {
    theme?: 'light' | 'dark';
    size?: 'normal' | 'compact';
    language?: string;
  } = {}
) {
  const { theme = 'light', size = 'normal', language = 'zh-CN' } = options;

  return {
    sitekey: siteKey,
    theme,
    size,
    language,
  };
}
