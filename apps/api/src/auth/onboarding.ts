/**
 * OOBE 管理员初始化模块
 *
 * 功能：
 * - 检查系统是否已有管理员
 * - 创建首个管理员账户
 * - 防止重复创建管理员
 */

import { eq } from "drizzle-orm";
import { users } from "@cf-blog/db/schema";
import type { NewUser } from "@cf-blog/db/schema";

// 管理员设置状态 KV Key
const ONBOARDING_COMPLETE_KEY = "onboarding_complete";

/**
 * 使用 SHA-256 哈希密码（与 auth.ts 保持一致）
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 检查是否已完成 OOBE（已有管理员）
 */
export async function isOnboardingComplete(kv: KVNamespace): Promise<boolean> {
  const value = await kv.get(ONBOARDING_COMPLETE_KEY);
  return value === "true";
}

/**
 * 标记 OOBE 已完成
 */
export async function markOnboardingComplete(kv: KVNamespace): Promise<void> {
  await kv.put(ONBOARDING_COMPLETE_KEY, "true");
}

/**
 * 创建管理员账户
 */
export async function createAdminUser(
  db: any,
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; error?: string; userId?: number }> {
  try {
    // 检查是否已有管理员
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.role, "admin"),
    });

    if (existingAdmin) {
      return { success: false, error: "管理员已存在" };
    }

    // 检查邮箱是否已注册
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { success: false, error: "邮箱已被注册" };
    }

    // 使用 SHA-256 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建管理员用户
    const newUser: NewUser = {
      email,
      name,
      passwordHash,
      role: "admin",
      isApproved: true, // 管理员自动审批
      githubId: null,
      avatar: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(users).values(newUser).returning({ id: users.id });
    const userId = result[0]?.id;

    if (!userId) {
      return { success: false, error: "创建用户失败" };
    }

    return { success: true, userId };
  } catch (error) {
    console.error("[OOBE] 创建管理员失败:", error);
    return { success: false, error: "服务器错误" };
  }
}

/**
 * 验证管理员创建请求
 */
export function validateAdminCreateRequest(data: unknown): {
  valid: boolean;
  error?: string;
} {
  const obj = data as Record<string, unknown> | null;
  const { email, password, name } = obj || {};

  if (!email || typeof email !== "string") {
    return { valid: false, error: "邮箱不能为空" };
  }

  if (!password || typeof password !== "string") {
    return { valid: false, error: "密码不能为空" };
  }

  if (password.length < 8) {
    return { valid: false, error: "密码至少 8 位" };
  }

  if (!name || typeof name !== "string") {
    return { valid: false, error: "名称不能为空" };
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "邮箱格式不正确" };
  }

  return { valid: true };
}
