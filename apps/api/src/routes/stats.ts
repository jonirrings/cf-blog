/**
 * 统计相关 API 路由
 *
 * - GET /api/stats - 获取仪表盘统计数据
 */

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, or, sql } from "drizzle-orm";
import type { Env } from "../index";
import { posts, comments, users } from "@cf-blog/db/schema";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  try {
    const db = drizzle(c.env.DB);

    const totalPosts = await db.select({ count: posts.id }).from(posts).all();
    const publishedPosts = await db
      .select({ count: posts.id })
      .from(posts)
      .where(eq(posts.status, "published"))
      .all();
    const draftPosts = await db
      .select({ count: posts.id })
      .from(posts)
      .where(eq(posts.status, "draft"))
      .all();

    const totalComments = await db.select({ count: comments.id }).from(comments).all();
    const pendingComments = await db
      .select({ count: comments.id })
      .from(comments)
      .where(or(eq(comments.userApproved, false), eq(comments.postApproved, false)))
      .all();

    const totalUsers = await db.select({ count: users.id }).from(users).all();
    const pendingUsers = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.isApproved, false))
      .all();

    const totalViewsResult = await db
      .select({ sum: sql<number>`SUM(${posts.viewCount})` })
      .from(posts)
      .all();
    const totalViews = totalViewsResult[0]?.sum || 0;

    const data = {
      totalPosts: totalPosts[0]?.count || 0,
      publishedPosts: publishedPosts[0]?.count || 0,
      draftPosts: draftPosts[0]?.count || 0,
      totalComments: totalComments[0]?.count || 0,
      pendingComments: pendingComments[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      pendingUsers: pendingUsers[0]?.count || 0,
      totalViews,
    };

    return c.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Stats API error:", err);
    return c.json(
      {
        success: false,
        error: "Failed to fetch stats",
      },
      500,
    );
  }
});

export default app;
