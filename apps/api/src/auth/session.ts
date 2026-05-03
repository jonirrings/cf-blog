/**
 * Session 管理模块
 *
 * 功能：
 * - 创建 Session（登录成功后）
 * - 验证 Session（从 Cookie 解析）
 * - 销毁 Session（登出）
 * - Session 数据序列化/反序列化
 */

import { SignJWT, jwtVerify } from 'jose';
import type { User } from '@cf-blog/db/schema';

// Session 数据类型
export interface SessionPayload {
  [key: string]: unknown;
  id: string;
  userId: number;
  userEmail: string;
  userName: string;
  userRole: 'admin' | 'publisher' | 'commenter';
  isApproved: boolean;
  expiresAt: number; // 时间戳
  createdAt: number;
}

// Cookie 配置
const COOKIE_NAME = 'cf-blog-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 天
const MAX_AGE = 7 * 24 * 60 * 60; // 7 天（秒）

/**
 * 获取 JWT Secret（从环境变量）
 */
function getSecret(env: { JWT_SECRET?: string }): Uint8Array {
  const secret = env.JWT_SECRET || 'dev-secret-key-change-in-production';
  return new TextEncoder().encode(secret);
}

/**
 * 创建 Session
 */
export async function createSession(
  user: User & { email: string; name: string },
  env: { JWT_SECRET?: string }
): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    id: crypto.randomUUID(),
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role as 'admin' | 'publisher' | 'commenter',
    isApproved: user.isApproved,
    expiresAt: now + SESSION_DURATION,
    createdAt: now,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor((now + SESSION_DURATION) / 1000))
    .sign(getSecret(env));

  return token;
}

/**
 * 验证 Session
 */
export async function verifySession(
  token: string,
  env: { JWT_SECRET?: string }
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(env));
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * 从请求中获取 Session Token
 */
export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;

  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match?.[1] || null;
}

/**
 * 获取当前 Session（从请求）
 */
export async function getSession(
  request: Request,
  env: { JWT_SECRET?: string }
): Promise<SessionPayload | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  return verifySession(token, env);
}

/**
 * 创建 Set-Cookie 头
 */
export function createSessionCookie(token: string, isSecure = false): string {
  const attributes = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    `Max-Age=${MAX_AGE}`,
    isSecure ? 'Secure' : '',
    'HttpOnly',
    'SameSite=Lax',
  ].filter(Boolean);

  return attributes.join('; ');
}

/**
 * 创建清除 Session 的 Cookie
 */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

/**
 * 检查 Session 是否过期
 */
export function isSessionExpired(session: SessionPayload): boolean {
  return Date.now() > session.expiresAt;
}

/**
 * 检查用户是否为管理员
 */
export function isAdmin(session: SessionPayload | null): boolean {
  return session?.userRole === 'admin';
}

/**
 * 检查用户是否为发布者
 */
export function isPublisher(session: SessionPayload | null): boolean {
  return session?.userRole === 'publisher' || session?.userRole === 'admin';
}

/**
 * 检查用户是否已审批
 */
export function isApproved(session: SessionPayload | null): boolean {
  return session?.isApproved === true;
}
