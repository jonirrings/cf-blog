/**
 * 认证相关 API 路由
 *
 * - GET /api/auth/github - GitHub OAuth 初始化
 * - GET /api/auth/github/callback - GitHub OAuth 回调
 * - POST /api/auth/logout - 登出
 * - GET /api/auth/session - 获取当前 Session
 * - POST /api/auth/onboarding - OOBE 管理员初始化
 * - GET /api/auth/onboarding/status - 检查 OOBE 状态
 * - POST /api/auth/login - 邮箱密码登录
 * - POST /api/auth/register - 邮箱密码注册
 */

import { Hono } from 'hono';
import type { Env } from '../index';
import { generateState, getGitHubAuthUrl, handleGitHubCallback } from '../auth/github';
import {
  getSession,
  createSessionCookie,
  clearSessionCookie,
  createSession,
} from '../auth/session';
import {
  isOnboardingComplete,
  createAdminUser,
  markOnboardingComplete,
  validateAdminCreateRequest,
} from '../auth/onboarding';
import { authMiddleware } from '../auth/middleware';
import type { AuthContext } from '../auth/middleware';
import { eq } from 'drizzle-orm';
import { users } from '@cf-blog/db/schema';
import * as schema from '@cf-blog/db/schema';
import { drizzle } from 'drizzle-orm/d1';

const app = new Hono<{ Bindings: Env }>();

/**
 * 简单的密码哈希函数（生产环境建议使用 bcrypt）
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证密码
 */
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

/**
 * GET /api/auth/github - GitHub OAuth 初始化
 */
app.get('/github', async (c) => {
  const { GITHUB_CLIENT_ID, SITE_URL } = c.env;

  if (!GITHUB_CLIENT_ID) {
    return c.json({ error: 'GitHub OAuth 未配置' }, 500);
  }

  const state = generateState();
  const redirectUri = `${SITE_URL}/api/auth/github/callback`;

  // 存储 state 到 KV（用于回调验证）
  await c.env.CONFIG_KV.put(`github_state:${state}`, 'true', { expirationTtl: 300 });

  const authUrl = getGitHubAuthUrl(GITHUB_CLIENT_ID, redirectUri, state);

  return c.json({ authUrl, state });
});

/**
 * GET /api/auth/github/callback - GitHub OAuth 回调
 */
app.get('/github/callback', async (c) => {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SITE_URL, CONFIG_KV } = c.env;

  const code = c.req.query('code');
  const state = c.req.query('state');

  if (!code) {
    return c.json({ error: '缺少授权码' }, 400);
  }

  // 验证 state
  const stateValid = await CONFIG_KV.get(`github_state:${state}`);
  if (!stateValid) {
    return c.json({ error: 'State 验证失败，可能已过期或 CSRF 攻击' }, 400);
  }

  // 删除 state
  await CONFIG_KV.delete(`github_state:${state}`);

  const redirectUri = `${SITE_URL}/api/auth/github/callback`;

  const result = await handleGitHubCallback(
    c.env.DB,
    code,
    GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET || '',
    redirectUri
  );

  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }

  // 设置 Session Cookie
  const cookie = createSessionCookie(result.sessionToken!, c.env.ENVIRONMENT === 'production');

  // 重定向到前端页面
  const frontendUrl = c.req.query('redirect') || '/';
  return c.redirect(frontendUrl, 302);
});

/**
 * POST /api/auth/logout - 登出
 */
app.post('/logout', authMiddleware, async (c) => {
  // 清除 Session Cookie
  return new Response('Logged out', {
    status: 200,
    headers: {
      'Set-Cookie': clearSessionCookie(),
      'Content-Type': 'text/plain',
    },
  });
});

/**
 * GET /api/auth/session - 获取当前 Session
 */
app.get('/session', async (c) => {
  const session = await getSession(c.req.raw, c.env);

  if (!session) {
    return c.json({ success: true, session: null });
  }

  // 检查是否过期
  if (Date.now() > session.expiresAt) {
    return c.json(
      { success: true, session: null, expired: true },
      {
        headers: { 'Set-Cookie': clearSessionCookie() },
      }
    );
  }

  return c.json({
    success: true,
    session: {
      id: session.id,
      userId: session.userId,
      userName: session.userName,
      userRole: session.userRole,
      isApproved: session.isApproved,
    },
  });
});

/**
 * POST /api/auth/onboarding - OOBE 管理员初始化
 */
app.post('/onboarding', async (c) => {
  // 检查是否已完成
  const completed = await isOnboardingComplete(c.env.CONFIG_KV);
  if (completed) {
    return c.json({ error: 'OOBE 已完成' }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const validation = validateAdminCreateRequest(body);

  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  const { email, password, name } = body;
  const result = await createAdminUser(c.env.DB, email, password, name);

  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }

  // 标记 OOBE 完成
  await markOnboardingComplete(c.env.CONFIG_KV);

  return c.json({ success: true, userId: result.userId });
});

/**
 * GET /api/auth/onboarding/status - 检查 OOBE 状态
 */
app.get('/onboarding/status', async (c) => {
  const completed = await isOnboardingComplete(c.env.CONFIG_KV);
  return c.json({ success: true, completed });
});

/**
 * POST /api/auth/login - 邮箱密码登录
 */
app.post('/login', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: '邮箱和密码不能为空' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return c.json({ error: '邮箱或密码错误' }, 401);
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.passwordHash!);
    if (!isValid) {
      return c.json({ error: '邮箱或密码错误' }, 401);
    }

    // 创建 Session
    const sessionToken = await createSession(
      { ...user, email: user.email, name: user.name },
      c.env
    );

    const cookie = createSessionCookie(sessionToken, c.env.ENVIRONMENT === 'production');

    return c.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isApproved: user.isApproved,
        },
      },
      {
        headers: { 'Set-Cookie': cookie },
      }
    );
  } catch (error) {
    console.error('[Login] 登录失败:', error);
    return c.json({ error: '登录失败' }, 500);
  }
});

/**
 * POST /api/auth/register - 邮箱密码注册
 */
app.post('/register', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: '邮箱、密码和名称不能为空' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: '密码长度至少为 6 位' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });

    // 检查邮箱是否已存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return c.json({ error: '该邮箱已被注册' }, 400);
    }

    // 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const now = new Date().toISOString();
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: 'commenter', // 新用户默认为评论者
        isApproved: false, // 需要管理员审批
        publisherApplicationStatus: 'none',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isApproved: newUser.isApproved,
      },
      message: '注册成功，请等待管理员审批',
    });
  } catch (error) {
    console.error('[Register] 注册失败:', error);
    return c.json({ error: '注册失败' }, 500);
  }
});

export default app;
