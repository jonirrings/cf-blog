/**
 * 用户相关 API 路由
 *
 * - GET /api/users/me - 获取当前用户信息
 * - PUT /api/users/me - 更新当前用户信息
 * - GET /api/users/pending - 获取待审批用户列表（管理员）
 * - PUT /api/users/:id/approve - 审批用户（管理员）
 * - POST /api/users/publisher-apply - 申请成为发布者
 * - GET /api/users/publisher-applications - 获取发布者申请列表（管理员）
 * - PUT /api/users/publisher-applications/:id/approve - 审批发布者申请（管理员）
 */

import { Hono } from "hono";
import type { Env } from "../index";
import { authMiddleware, adminMiddleware, requireAuth } from "../auth/middleware";
import { getSession } from "../auth/session";
import { getPendingUsers, approveUser, rejectUser } from "../approval/user";
import {
  applyForPublisher,
  getPendingApplications,
  approvePublisherApplication,
  rejectPublisherApplication,
} from "../approval/publisher";

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/users/me - 获取当前用户信息
 */
app.get("/me", authMiddleware, async (c: any) => {
  const session = c.session;

  return c.json({
    success: true,
    user: {
      id: session.userId,
      name: session.userName,
      email: session.userEmail,
      role: session.userRole,
      isApproved: session.isApproved,
    },
  });
});

/**
 * GET /api/users/pending - 获取待审批用户列表（管理员）
 */
app.get("/pending", adminMiddleware, async (c) => {
  const pendingUsers = await getPendingUsers(c.env.DB);

  return c.json({
    success: true,
    users: pendingUsers,
  });
});

/**
 * PUT /api/users/:id/approve - 审批用户（管理员）
 */
app.put("/:id/approve", adminMiddleware, async (c: any) => {
  const userId = parseInt(c.req.param("id"));
  const session = c.session;

  if (isNaN(userId)) {
    return c.json({ error: "无效的用户 ID" }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const action = body.action; // 'approve' or 'reject'
  const reason = body.reason;

  if (action === "approve") {
    const result = await approveUser(c.env.DB, userId, session.userId);
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }
    return c.json({ success: true });
  } else if (action === "reject") {
    const result = await rejectUser(c.env.DB, userId, session.userId, reason);
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }
    return c.json({ success: true });
  }

  return c.json({ error: "无效的操作" }, 400);
});

/**
 * POST /api/users/publisher-apply - 申请成为发布者
 */
app.post("/publisher-apply", requireAuth(), async (c: any) => {
  const session = c.session;

  const result = await applyForPublisher(c.env.DB, session.userId);

  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }

  return c.json({ success: true });
});

/**
 * GET /api/users/publisher-applications - 获取发布者申请列表（管理员）
 */
app.get("/publisher-applications", adminMiddleware, async (c) => {
  const applications = await getPendingApplications(c.env.DB);

  return c.json({
    success: true,
    applications,
  });
});

/**
 * PUT /api/users/publisher-applications/:id/approve - 审批发布者申请（管理员）
 */
app.put("/publisher-applications/:id/approve", adminMiddleware, async (c: any) => {
  const userId = parseInt(c.req.param("id"));
  const session = c.session;

  if (isNaN(userId)) {
    return c.json({ error: "无效的用户 ID" }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const action = body.action; // 'approve' or 'reject'
  const reason = body.reason;

  if (action === "approve") {
    const result = await approvePublisherApplication(c.env.DB, userId, session.userId);
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }
    return c.json({ success: true });
  } else if (action === "reject") {
    const result = await rejectPublisherApplication(c.env.DB, userId, session.userId, reason);
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }
    return c.json({ success: true });
  }

  return c.json({ error: "无效的操作" }, 400);
});

export default app;
