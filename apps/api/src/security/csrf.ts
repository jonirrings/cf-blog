/**
 * CSRF 防护模块
 *
 * 功能：
 * - 生成 CSRF Token
 * - 验证 CSRF Token
 * - Double Submit Cookie 模式
 */

import { timingSafeEqual } from 'crypto';

/**
 * 生成 CSRF Token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 从 Cookie 中获取 CSRF Token
 */
export function getCSRFTokenFromCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;

  const match = cookie.match(/csrf_token=([^;]+)/);
  return match?.[1] || null;
}

/**
 * 从请求头中获取 CSRF Token
 */
export function getCSRFTokenFromHeader(request: Request): string | null {
  return request.headers.get('X-CSRF-Token');
}

/**
 * 验证 CSRF Token（定时安全比较）
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false;
  }

  if (token.length !== expectedToken.length) {
    return false;
  }

  // 使用定时安全比较防止时序攻击
  try {
    const a = new TextEncoder().encode(token);
    const b = new TextEncoder().encode(expectedToken);
    return timingSafeEqual(a, b);
  } catch {
    // Node.js 环境 fallback
    return token === expectedToken;
  }
}

/**
 * 创建 CSRF Cookie
 */
export function createCSRFCookie(token: string, isSecure = false): string {
  const attributes = [
    `csrf_token=${token}`,
    'Path=/',
    'SameSite=Strict',
    isSecure ? 'Secure' : '',
    'HttpOnly',
  ].filter(Boolean);

  return attributes.join('; ');
}

/**
 * CSRF 防护中间件
 */
export function csrfMiddleware(options: { excludePaths?: string[]; cookieSecure?: boolean } = {}) {
  const { excludePaths = ['/api/auth/github/callback'], cookieSecure = false } = options;

  return async (c: any, next: any) => {
    const method = c.req.method;

    // 只对变更操作进行验证
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      // 检查是否在排除列表中
      const isExcluded = excludePaths.some((path) => c.req.path.startsWith(path));
      if (!isExcluded) {
        const cookieToken = getCSRFTokenFromCookie(c.req.raw);
        const headerToken = getCSRFTokenFromHeader(c.req.raw);

        if (!cookieToken || !headerToken) {
          return c.json(
            {
              success: false,
              error: 'Forbidden',
              message: 'CSRF Token 缺失',
            },
            403
          );
        }

        if (!verifyCSRFToken(cookieToken, headerToken)) {
          return c.json(
            {
              success: false,
              error: 'Forbidden',
              message: 'CSRF Token 无效',
            },
            403
          );
        }
      }
    }

    // 为响应添加 CSRF Token（用于首次加载）
    if (method === 'GET') {
      const existingToken = getCSRFTokenFromCookie(c.req.raw);
      if (!existingToken) {
        const newToken = generateCSRFToken();
        c.header('Set-Cookie', createCSRFCookie(newToken, cookieSecure));
        c.header('X-CSRF-Token', newToken);
      }
    }

    await next();
  };
}

/**
 * 双重提交 Cookie 验证
 */
export function validateDoubleSubmitCookie(
  cookieToken: string | null,
  bodyToken: string | null
): boolean {
  if (!cookieToken || !bodyToken) {
    return false;
  }
  return verifyCSRFToken(cookieToken, bodyToken);
}
