/**
 * 用户偏好配置管理
 *
 * 功能：
 * - 获取用户偏好
 * - 更新用户偏好
 * - 用户偏好类型定义
 */

// 用户偏好类型
export interface UserPreferences {
  // 界面设置
  theme: "light" | "dark" | "system";
  language: string;
  fontSize: "small" | "medium" | "large";

  // 通知设置
  notifications: {
    email: boolean;
    browser: boolean;
    commentReply: boolean;
    commentApproved: boolean;
    postUpdate: boolean;
  };

  // 隐私设置
  privacy: {
    showOnlineStatus: boolean;
    showReadingHistory: boolean;
  };

  // 编辑器设置
  editor: {
    autoSave: boolean;
    autoSaveInterval: number; // 秒
  };
}

// 默认用户偏好
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "system",
  language: "zh-CN",
  fontSize: "medium",
  notifications: {
    email: false,
    browser: true,
    commentReply: true,
    commentApproved: true,
    postUpdate: true,
  },
  privacy: {
    showOnlineStatus: true,
    showReadingHistory: false,
  },
  editor: {
    autoSave: true,
    autoSaveInterval: 30,
  },
};

/**
 * 生成用户偏好 Key
 */
function getUserConfigKey(userId: number): string {
  return `user_config:${userId}`;
}

/**
 * 获取用户偏好
 */
export async function getUserPreferences(
  kv: KVNamespace,
  userId: number,
): Promise<UserPreferences> {
  const key = getUserConfigKey(userId);
  const config = await kv.get(key);
  if (!config) {
    return DEFAULT_USER_PREFERENCES;
  }
  return JSON.parse(config) as UserPreferences;
}

/**
 * 更新用户偏好
 */
export async function updateUserPreferences(
  kv: KVNamespace,
  userId: number,
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const key = getUserConfigKey(userId);
  const current = await getUserPreferences(kv, userId);
  const newPreferences = mergePreferences(current, preferences);
  await kv.put(key, JSON.stringify(newPreferences));
  return newPreferences;
}

/**
 * 合并偏好设置
 */
function mergePreferences(
  current: UserPreferences,
  update: Partial<UserPreferences>,
): UserPreferences {
  const merged: UserPreferences = { ...current };

  if (update.theme) merged.theme = update.theme;
  if (update.language) merged.language = update.language;
  if (update.fontSize) merged.fontSize = update.fontSize;

  if (update.notifications) {
    merged.notifications = { ...merged.notifications, ...update.notifications };
  }

  if (update.privacy) {
    merged.privacy = { ...merged.privacy, ...update.privacy };
  }

  if (update.editor) {
    merged.editor = { ...merged.editor, ...update.editor };
  }

  return merged;
}

/**
 * 删除用户偏好
 */
export async function deleteUserPreferences(kv: KVNamespace, userId: number): Promise<void> {
  const key = getUserConfigKey(userId);
  await kv.delete(key);
}
