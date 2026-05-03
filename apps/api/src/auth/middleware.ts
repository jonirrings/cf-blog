/**
 * 认证和权限中间件
 *
 * 功能：
 * - 验证用户是否登录
 * - 验证用户角色权限
 * - 验证用户审批状态
 * - 审计日志记录
 */

import type { Context, Next } from 'hono';
import { getSession, getSessionToken, type SessionPayload } from './session';
import type { Env } from '../index';
import { auditLogs } from '@cf-blog/db/schema';

// 扩展 Hono Context 类型
export interface AuthContext extends Context<{ Bindings: Env }> {
  session?: SessionPayload;
}

/**
 * 认证中间件 - 验证用户是否登录
 */
export async function authMiddleware(c: AuthContext, next: Next): Promise<Response | void> {
  const session = await getSession(c.req.raw, c.env);

  if (!session) {
    return c.json({ success: false, error: 'Unauthorized', message: '请先登录' }, 401);
  }

  // 检查 Session 是否过期
  if (Date.now() > session.expiresAt) {
    return c.json({ success: false, error: 'Unauthorized', message: 'Session 已过期' }, 401);
  }

  // 将 Session 附加到 Context
  c.session = session;
  await next();
}

/**
 * 可选认证中间件 - 登录与否均可访问
 */
export async function optionalAuthMiddleware(c: AuthContext, next: Next): Promise<void> {
  const session = await getSession(c.req.raw, c.env);
  c.session = session || undefined;
  await next();
}

/**
 * 管理员权限中间件
 */
export async function adminMiddleware(c: AuthContext, next: Next): Promise<Response | void> {
  const session = await getSession(c.req.raw, c.env);

  if (!session) {
    return c.json({ success: false, error: 'Unauthorized', message: '请先登录' }, 401);
  }

  if (session.userRole !== 'admin') {
    return c.json({ success: false, error: 'Forbidden', message: '需要管理员权限' }, 403);
  }

  c.session = session;
  await next();
}

/**
 * 发布者权限中间件（Publisher 或 Admin）
 */
export async function publisherMiddleware(c: AuthContext, next: Next): Promise<Response | void> {
  const session = await getSession(c.req.raw, c.env);

  if (!session) {
    return c.json({ success: false, error: 'Unauthorized', message: '请先登录' }, 401);
  }

  if (session.userRole !== 'publisher' && session.userRole !== 'admin') {
    return c.json({ success: false, error: 'Forbidden', message: '需要发布者权限' }, 403);
  }

  c.session = session;
  await next();
}

/**
 * 已审批用户中间件
 */
export async function approvedMiddleware(c: AuthContext, next: Next): Promise<Response | void> {
  const session = await getSession(c.req.raw, c.env);

  if (!session) {
    return c.json({ success: false, error: 'Unauthorized', message: '请先登录' }, 401);
  }

  if (!session.isApproved) {
    return c.json({ success: false, error: 'Forbidden', message: '您的账号待审批' }, 403);
  }

  c.session = session;
  await next();
}

/**
 * 组合中间件 - 需要登录且已审批
 */
export function requireAuth() {
  return [authMiddleware, approvedMiddleware];
}

/**
 * 组合中间件 - 需要发布者权限
 */
export function requirePublisher() {
  return [authMiddleware, publisherMiddleware];
}

/**
 * 组合中间件 - 需要管理员权限
 */
export function requireAdmin() {
  return [authMiddleware, adminMiddleware];
}

/**
 * 检查用户是否有权限操作某篇文章
 */
export function canEditPost(session: SessionPayload | null, postAuthorId: number): boolean {
  if (!session) return false;
  // 管理员可以编辑任何文章
  if (session.userRole === 'admin') return true;
  // 作者可以编辑自己的文章
  if (session.userId === postAuthorId) return true;
  return false;
}

/**
 * 检查用户是否有权限删除某篇文章
 */
export function canDeletePost(session: SessionPayload | null, postAuthorId: number): boolean {
  if (!session) return false;
  // 只有管理员和作者可以删除
  if (session.userRole === 'admin') return true;
  if (session.userId === postAuthorId) return true;
  return false;
}

/**
 * 检查用户是否有权限审批评论
 */
export function canApproveComment(session: SessionPayload | null, postAuthorId: number): boolean {
  if (!session) return false;
  // 管理员可以审批任何评论
  if (session.userRole === 'admin') return true;
  // 文章作者可以审批自己文章下的评论
  if (session.userId === postAuthorId && session.userRole === 'publisher') return true;
  return false;
}

/**
 * 审计日志记录
 */
export async function auditLog(
  db: any,
  session: SessionPayload | null,
  action: string,
  resource: string,
  resourceType: string,
  resourceId: number | string,
  details?: Record<string, any>
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: session?.userId ?? null,
      action: action as any,
      resource,
      resourceType,
      resourceId: typeof resourceId === 'number' ? resourceId : parseInt(resourceId, 10),
      success: true,
      metadata: details ? JSON.stringify(details) : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AuditLog] 记录失败:', error);
  }
}
