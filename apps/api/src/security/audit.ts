/**
 * 审计日志模块
 *
 * 记录所有敏感操作的审计日志
 */

import { auditLogs, type AuditAction } from "@cf-blog/db/schema";

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
  },
): Promise<boolean> {
  try {
    await db.insert(auditLogs).values({
      userId: data.userId,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      details: data.details ? JSON.stringify(data.details) : null,
      ip: data.ip || null,
      userAgent: data.userAgent || null,
      timestamp: new Date(),
    });
    return true;
  } catch (error) {
    console.error("[AuditLog] 记录失败:", error);
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
  } = {},
): Promise<{
  logs: any[];
  total: number;
  page: number;
  limit: number;
}> {
  const { page = 1, limit = 50, action, userId, targetType, startDate, endDate } = options;

  const offset = (page - 1) * limit;

  // 构建查询条件
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (action) {
    whereClauses.push("action = ?");
    params.push(action);
  }

  if (userId) {
    whereClauses.push("userId = ?");
    params.push(userId);
  }

  if (targetType) {
    whereClauses.push("targetType = ?");
    params.push(targetType);
  }

  if (startDate) {
    whereClauses.push("timestamp >= ?");
    params.push(startDate.toISOString());
  }

  if (endDate) {
    whereClauses.push("timestamp <= ?");
    params.push(endDate.toISOString());
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // 查询总数
  const totalResult = await db
    .select({ count: integer("count") })
    .from(auditLogs)
    .where(whereClause ? sql.raw(whereClause) : undefined)
    .get();

  // 查询日志
  const logs = await db
    .select()
    .from(auditLogs)
    .where(whereClause ? sql.raw(whereClause) : undefined)
    .orderBy(auditLogs.timestamp)
    .limit(limit)
    .offset(offset);

  return {
    logs,
    total: totalResult?.count || 0,
    page,
    limit,
  };
}
