/**
 * GitHub OAuth 认证模块
 *
 * 功能：
 * - 生成 GitHub OAuth 授权 URL
 * - 处理 OAuth 回调
 * - 交换授权码获取 Access Token
 * - 获取 GitHub 用户信息
 * - 创建/更新本地用户
 */

import type { NewUser } from '@cf-blog/db/schema';
import { sessions, users } from '@cf-blog/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from './session';

// GitHub OAuth 配置
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

/**
 * 生成 GitHub OAuth 授权 URL
 */
export function getGitHubAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'read:user user:email',
  });

  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

/**
 * 生成状态码（用于 CSRF 防护）
 */
export function generateState(): string {
  return crypto.randomUUID();
}

/**
 * 交换授权码获取 Access Token
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ accessToken: string; error?: string }> {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;

  if (data.error) {
    return { accessToken: '', error: (data.error_description as string) || (data.error as string) };
  }

  return { accessToken: data.access_token as string };
}

/**
 * 获取 GitHub 用户信息
 */
export async function getGitHubUser(accessToken: string): Promise<{
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  error?: string;
}> {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return {
      id: 0,
      login: '',
      name: null,
      email: null,
      avatar_url: null,
      error: '获取用户信息失败',
    };
  }

  return response.json();
}

/**
 * 处理 GitHub OAuth 回调
 * 创建或更新本地用户
 */
export async function handleGitHubCallback(
  db: any,
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{
  success: boolean;
  sessionToken?: string;
  error?: string;
  isNewUser?: boolean;
}> {
  try {
    // 1. 交换 Access Token
    const { accessToken, error: tokenError } = await exchangeCodeForToken(
      code,
      clientId,
      clientSecret,
      redirectUri
    );

    if (tokenError) {
      return { success: false, error: `GitHub Token 交换失败：${tokenError}` };
    }

    // 2. 获取 GitHub 用户信息
    const githubUser = await getGitHubUser(accessToken);

    if (githubUser.error) {
      return { success: false, error: githubUser.error };
    }

    // 3. 检查用户是否已存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.githubId, githubUser.id.toString()),
    });

    if (existingUser) {
      // 用户已存在，创建 Session
      const sessionToken = await createSession(existingUser, {} as any);
      return { success: true, sessionToken, isNewUser: false };
    }

    // 4. 创建新用户
    const email = githubUser.email || `${githubUser.login}@users.noreply.github.com`;

    const newUser: NewUser = {
      email,
      name: githubUser.name || githubUser.login,
      passwordHash: null,
      role: 'commenter',
      isApproved: false,
      publisherApplicationStatus: 'none',
      githubId: githubUser.id.toString(),
      avatar: githubUser.avatar_url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.insert(users).values(newUser).returning();
    const user = result[0];

    if (!user) {
      return { success: false, error: '创建用户失败' };
    }

    // 5. 创建 Session
    const sessionToken = await createSession(user, {} as any);
    return { success: true, sessionToken, isNewUser: true };
  } catch (error) {
    console.error('[GitHub OAuth] 回调处理失败:', error);
    return { success: false, error: '服务器错误' };
  }
}
