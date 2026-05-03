/**
 * 审计日志模块
 *
 * 记录所有敏感操作的审计日志
 */

import { type AuditAction, auditLogs } from '@cf-blog/db/schema';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

/**
 * 记录审计日志
 */
export async function createAuditLog(
  db: any,
  data: {
    userId: number | null;
    action: AuditAction;
    targetType: string;
    targetId: string;
    details?: Record<string, any>;
    ip?: string;
    userAgent?: string;
  }
): Promise<boolean> {
  try {
    await db.insert(auditLogs).values({
      userId: data.userId,
      action: data.action,
      resource: `${data.targetType}:${data.targetId}`,
      resourceType: data.targetType,
      resourceId: typeof data.targetId === 'number' ? data.targetId : parseInt(data.targetId, 10),
      ipAddress: data.ip || null,
      userAgent: data.userAgent || null,
      metadata: data.details ? JSON.stringify(data.details) : null,
      success: true,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('[AuditLog] 记录失败:', error);
    return false;
  }
}

/**
 * 获取审计日志列表
 */
export async function getAuditLogs(
  db: any,
  options: {
    page?: number;
    limit?: number;
    action?: AuditAction;
    userId?: number;
    targetType?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<{
  logs: any[];
  total: number;
  page: number;
  limit: number;
}> {
  const { page = 1, limit = 50, action, userId, targetType, startDate, endDate } = options;

  const offset = (page - 1) * limit;

  // 构建查询条件
  const conditions = [];

  if (action) {
    conditions.push(eq(auditLogs.action, action));
  }

  if (userId) {
    conditions.push(eq(auditLogs.userId, userId));
  }

  if (targetType) {
    conditions.push(eq(auditLogs.resourceType, targetType));
  }

  if (startDate) {
    conditions.push(gte(auditLogs.timestamp, startDate.toISOString()));
  }

  if (endDate) {
    conditions.push(lte(auditLogs.timestamp, endDate.toISOString()));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 查询总数
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(whereClause)
    .get();

  // 查询日志
  const logs = await db
    .select()
    .from(auditLogs)
    .where(whereClause)
    .orderBy(desc(auditLogs.timestamp))
    .limit(limit)
    .offset(offset);

  return {
    logs,
    total: totalResult?.count ?? 0,
    page,
    limit,
  };
}
