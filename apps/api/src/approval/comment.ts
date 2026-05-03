/**
 * 评论审批模块
 *
 * 功能：
 * - 获取待审批评论列表
 * - 审批通过评论（用户审批 + 文章作者审批）
 * - 拒绝评论
 * - 二级审批逻辑
 */

import { eq, and, or } from "drizzle-orm";
import { comments, users, posts, auditLogs } from "@cf-blog/db/schema";

/**
 * 获取待审批评论列表
 */
export async function getPendingComments(
  db: any,
  postId?: number,
  userId?: number,
): Promise<any[]> {
  const conditions = [];

  // 按文章过滤
  if (postId) {
    conditions.push(eq(comments.postId, postId));
  }

  // 按用户过滤（查看自己待审批的评论）
  if (userId) {
    conditions.push(eq(comments.userId, userId));
  }

  // 待审批条件：用户未审批 或 文章作者未审批
  conditions.push(or(eq(comments.userApproved, false), eq(comments.postApproved, false)));

  // 排除已拒绝的评论
  conditions.push(eq(comments.rejected, false));

  return db.query.comments.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      user: {
        columns: { id: true, name: true, avatar: true },
      },
      post: {
        columns: { id: true, title: true, authorId: true },
      },
    },
    orderBy: (comments, { desc }) => [desc(comments.createdAt)],
  });
}

/**
 * 用户审批评论（一级审批）
 * 用户确认自己的评论可以提交审核
 */
export async function userApproveComment(
  db: any,
  commentId: number,
  userId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });

    if (!comment) {
      return { success: false, error: "评论不存在" };
    }

    // 只能审批自己的评论
    if (comment.userId !== userId) {
      return { success: false, error: "无权审批此评论" };
    }

    if (comment.userApproved) {
      return { success: false, error: "评论已通过用户审批" };
    }

    if (comment.rejected) {
      return { success: false, error: "评论已被拒绝" };
    }

    // 更新用户审批状态
    await db
      .update(comments)
      .set({
        userApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId));

    return { success: true };
  } catch (error) {
    console.error("[CommentApproval] 用户审批失败:", error);
    return { success: false, error: "审批失败" };
  }
}

/**
 * 文章作者审批评论（二级审批）
 * 作者确认评论可以公开显示
 */
export async function authorApproveComment(
  db: any,
  commentId: number,
  authorId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
      with: {
        post: { columns: { authorId: true } },
      },
    });

    if (!comment) {
      return { success: false, error: "评论不存在" };
    }

    // 只有文章作者可以审批
    if (comment.post.authorId !== authorId) {
      return { success: false, error: "无权审批此评论" };
    }

    if (comment.postApproved) {
      return { success: false, error: "评论已通过作者审批" };
    }

    if (comment.rejected) {
      return { success: false, error: "评论已被拒绝" };
    }

    // 更新作者审批状态
    await db
      .update(comments)
      .set({
        postApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId));

    // 记录审计日志
    await db.insert(auditLogs).values({
      userId: authorId,
      action: "COMMENT_APPROVED_BY_AUTHOR",
      targetType: "comment",
      targetId: commentId.toString(),
      details: JSON.stringify({ postId: comment.postId }),
      timestamp: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("[CommentApproval] 作者审批失败:", error);
    return { success: false, error: "审批失败" };
  }
}

/**
 * 管理员审批评论（一级审批 - 替代用户审批）
 */
export async function adminApproveComment(
  db: any,
  commentId: number,
  adminId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    });

    if (!comment) {
      return { success: false, error: "评论不存在" };
    }

    if (comment.rejected) {
      return { success: false, error: "评论已被拒绝" };
    }

    // 管理员审批同时通过用户审批和作者审批
    await db
      .update(comments)
      .set({
        userApproved: true,
        postApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId));

    // 记录审计日志
    await db.insert(auditLogs).values({
      userId: adminId,
      action: "COMMENT_APPROVED_BY_ADMIN",
      targetType: "comment",
      targetId: commentId.toString(),
      details: JSON.stringify({ postId: comment.postId }),
      timestamp: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("[CommentApproval] 管理员审批失败:", error);
    return { success: false, error: "审批失败" };
  }
}

/**
 * 拒绝评论
 */
export async function rejectComment(
  db: any,
  commentId: number,
  userId: number,
  isAdmin: boolean,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
      with: {
        post: { columns: { authorId: true } },
      },
    });

    if (!comment) {
      return { success: false, error: "评论不存在" };
    }

    // 检查权限：管理员 或 文章作者
    const canReject = isAdmin || comment.post.authorId === userId;
    if (!canReject) {
      return { success: false, error: "无权拒绝此评论" };
    }

    // 更新拒绝状态
    await db
      .update(comments)
      .set({
        rejected: true,
        userApproved: false,
        postApproved: false,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId));

    // 记录审计日志
    await db.insert(auditLogs).values({
      userId,
      action: "COMMENT_REJECTED",
      targetType: "comment",
      targetId: commentId.toString(),
      details: JSON.stringify({ postId: comment.postId, reason }),
      timestamp: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("[CommentApproval] 拒绝失败:", error);
    return { success: false, error: "拒绝失败" };
  }
}

/**
 * 检查评论是否对公众可见
 */
export function isCommentPublic(comment: any): boolean {
  return (
    comment.userApproved === true && comment.postApproved === true && comment.rejected === false
  );
}

/**
 * 检查评论是否对评论者可见
 */
export function isCommentVisibleToOwner(comment: any): boolean {
  return !comment.rejected; // 只要未被拒绝，评论者都可见
}

/**
 * 检查评论是否对文章作者可见
 */
export function isCommentVisibleToAuthor(comment: any): boolean {
  if (comment.rejected) return false; // 被拒绝的评论作者不可见
  return comment.userApproved === true; // 用户已审批即可见
}
