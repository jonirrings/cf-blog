/**
 * 用户审批模块
 *
 * 功能：
 * - 获取待审批用户列表
 * - 审批通过用户
 * - 拒绝用户
 * - 批量审批
 */

import { eq, and } from 'drizzle-orm';
import { users, auditLogs } from '@cf-blog/db/schema';

/**
 * 获取待审批用户列表
 */
export async function getPendingUsers(db: any): Promise<any[]> {
  return db.query.users.findMany({
    where: eq(users.isApproved, false),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      githubId: true,
      avatar: true,
      createdAt: true,
    },
    orderBy: (users: typeof import('@cf-blog/db/schema').users, { desc }: { desc: (col: any) => any }) => [desc(users.createdAt)],
  });
}

/**
 * 审批通过用户
 */
export async function approveUser(
  db: any,
  userId: number,
  adminUserId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // 检查用户是否存在
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, error: '用户不存在' };
    }

    if (user.isApproved) {
      return { success: false, error: '用户已审批通过' };
    }

    // 更新用户状态
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
      action: 'USER_APPROVED' as const,
      resource: `user:${userId}`,
      resourceType: 'user',
      resourceId: userId,
      success: true,
      metadata: JSON.stringify({ targetEmail: user.email }),
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('[UserApproval] 审批失败:', error);
    return { success: false, error: '审批失败' };
  }
}

/**
 * 拒绝用户
 */
export async function rejectUser(
  db: any,
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

    // 更新用户状态（标记为拒绝）
    await db
      .update(users)
      .set({
        isApproved: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));

    // 记录审计日志
    await db.insert(auditLogs).values({
      userId: adminUserId,
      action: 'USER_REJECTED' as const,
      resource: `user:${userId}`,
      resourceType: 'user',
      resourceId: userId,
      success: true,
      metadata: JSON.stringify({ targetEmail: user.email, reason }),
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('[UserApproval] 拒绝失败:', error);
    return { success: false, error: '拒绝失败' };
  }
}

/**
 * 批量审批用户
 */
export async function bulkApproveUsers(
  db: any,
  userIds: number[],
  adminUserId: number
): Promise<{ success: boolean; approved: number; errors: string[] }> {
  const errors: string[] = [];
  let approved = 0;

  for (const userId of userIds) {
    const result = await approveUser(db, userId, adminUserId);
    if (result.success) {
      approved++;
    } else {
      errors.push(`用户 ${userId}: ${result.error}`);
    }
  }

  return {
    success: errors.length === 0,
    approved,
    errors,
  };
}

/**
 * 检查用户是否有审批权限
 */
export function canApproveUsers(userRole: string | null): boolean {
  return userRole === 'admin';
}
