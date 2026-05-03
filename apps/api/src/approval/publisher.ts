/**
 * 发布者申请审批模块
 *
 * 功能：
 * - 用户申请成为发布者
 * - 获取申请列表
 * - 审批通过申请
 * - 拒绝申请
 */

import { auditLogs, users } from '@cf-blog/db/schema';
import type { BetterSQLite3Database } from 'drizzle-orm/sqlite-core';
import type * as schema from '@cf-blog/db/schema';
import { and, eq } from 'drizzle-orm';

type Db = BetterSQLite3Database<typeof schema>;

// 申请者状态枚举
export type PublisherApplicationStatus = 'pending' | 'approved' | 'rejected';

/**
 * 用户申请成为发布者
 */
export async function applyForPublisher(
  db: Db,
  userId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, error: '用户不存在' };
    }

    if (user.role === 'publisher' || user.role === 'admin') {
      return { success: false, error: '已是发布者或管理员' };
    }

    // 更新用户角色为 publisher（待审批）
    // 这里使用 isApproved 字段标记是否通过审批
    // 申请后保持 isApproved 状态，但 role 改为 publisher
    await db
      .update(users)
      .set({
        role: 'publisher',
        isApproved: false, // 需要管理员审批
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));

    // 记录审计日志
    await db.insert(auditLogs).values({
      userId,
      action: 'PUBLISHER_APPLICATION_SUBMITTED' as const,
      resource: `user:${userId}`,
      resourceType: 'application',
      resourceId: userId,
      success: true,
      metadata: JSON.stringify({ userEmail: user.email }),
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('[PublisherApplication] 申请失败:', error);
    return { success: false, error: '申请失败' };
  }
}

/**
 * 获取待审批的发布者申请列表
 */
export async function getPendingApplications(db: Db) {
  return db.query.users.findMany({
    where: and(eq(users.role, 'publisher'), eq(users.isApproved, false)),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      githubId: true,
      avatar: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: (
      users: typeof import('@cf-blog/db/schema').users,
      { desc }: { desc: (col: typeof users.updatedAt) => unknown }
    ) => [desc(users.updatedAt)],
  });
}

/**
 * 审批通过发布者申请
 */
export async function approvePublisherApplication(
  db: Db,
  userId: number,
  adminUserId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, error: '用户不存在' };
    }

    if (user.role !== 'publisher') {
      return { success: false, error: '用户不是申请者' };
    }

    if (user.isApproved) {
      return { success: false, error: '申请已审批通过' };
    }

    // 更新用户状态为已审批
    await db
      .update(users)
      .set({
        isApproved: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));

    // 记录审计日志
    await db.insert(auditLogs).values({
      userId: adminUserId,
      action: 'PUBLISHER_APPLICATION_APPROVED' as const,
      resource: `user:${userId}`,
      resourceType: 'application',
      resourceId: userId,
      success: true,
      metadata: JSON.stringify({ targetEmail: user.email }),
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('[PublisherApplication] 审批失败:', error);
    return { success: false, error: '审批失败' };
  }
}

/**
 * 拒绝发布者申请（降级为 commenter）
 */
export async function rejectPublisherApplication(
  db: Db,
  userId: number,
  adminUserId: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, error: '用户不存在' };
    }

    if (user.role !== 'publisher') {
      return { success: false, error: '用户不是申请者' };
    }

    // 降级为 commenter 并保持未审批状态
    await db
      .update(users)
      .set({
        role: 'commenter',
        isApproved: user.isApproved, // 保持原有审批状态
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));

    // 记录审计日志
    await db.insert(auditLogs).values({
      userId: adminUserId,
      action: 'PUBLISHER_APPLICATION_REJECTED' as const,
      resource: `user:${userId}`,
      resourceType: 'application',
      resourceId: userId,
      success: true,
      metadata: JSON.stringify({ targetEmail: user.email, reason }),
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('[PublisherApplication] 拒绝失败:', error);
    return { success: false, error: '拒绝失败' };
  }
}

/**
 * 检查用户是否可以申请成为发布者
 */
export function canApplyForPublisher(userRole: string | null, isApproved: boolean): boolean {
  // 只有已审批的 commenter 可以申请
  return userRole === 'commenter' && isApproved === true;
}

/**
 * 检查用户是否是发布者（已审批）
 */
export function isPublisher(userRole: string | null, isApproved: boolean | null): boolean {
  return userRole === 'publisher' && isApproved === true;
}
