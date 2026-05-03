/**
 * 配置相关 API 路由
 *
 * - GET /api/config/site - 获取站点配置
 * - PUT /api/config/site - 更新站点配置（管理员）
 * - GET /api/config/nav - 获取导航配置
 * - PUT /api/config/nav - 更新导航配置（管理员）
 * - GET /api/config/user - 获取用户偏好配置
 * - PUT /api/config/user - 更新用户偏好配置
 */

import { Hono } from 'hono';
import type { Env } from '../index';
import { adminMiddleware, authMiddleware } from '../auth/middleware';
import { getSiteConfig, updateSiteConfig } from '../config/site';
import { getNavConfig, updateNavConfig, getVisibleNavItems } from '../config/nav';
import { getUserPreferences, updateUserPreferences } from '../config/user';
import type { AuthContext } from '../auth/middleware';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/config/site - 获取站点配置
 */
app.get('/site', async (c) => {
  const config = await getSiteConfig(c.env.CONFIG_KV);
  return c.json({ success: true, config });
});

/**
 * PUT /api/config/site - 更新站点配置（管理员）
 */
app.put('/site', adminMiddleware, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const config = await updateSiteConfig(c.env.CONFIG_KV, body);
  return c.json({ success: true, config });
});

/**
 * GET /api/config/nav - 获取导航配置
 */
app.get('/nav', async (c) => {
  const items = await getNavConfig(c.env.CONFIG_KV);

  // 获取用户角色（如果有）
  const session = await c.env.CONFIG_KV.get('session'); // 简化处理
  const userRole = undefined; // 从 Session 获取

  const visibleItems = getVisibleNavItems(items, userRole);
  return c.json({ success: true, items: visibleItems });
});

/**
 * PUT /api/config/nav - 更新导航配置（管理员）
 */
app.put('/nav', adminMiddleware, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const items = body.items || [];
  const config = await updateNavConfig(c.env.CONFIG_KV, items);
  return c.json({ success: true, config });
});

/**
 * GET /api/config/user - 获取用户偏好配置
 */
app.get('/user', authMiddleware, async (c: any) => {
  const session = c.session;
  const preferences = await getUserPreferences(c.env.CONFIG_KV, session.userId);
  return c.json({ success: true, preferences });
});

/**
 * PUT /api/config/user - 更新用户偏好配置
 */
app.put('/user', authMiddleware, async (c: any) => {
  const session = c.session;
  const body = await c.req.json().catch(() => ({}));
  const preferences = await updateUserPreferences(c.env.CONFIG_KV, session.userId, body);
  return c.json({ success: true, preferences });
});

export default app;
