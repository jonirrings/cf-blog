/**
 * 导航配置管理
 *
 * 功能：
 * - 获取导航配置
 * - 更新导航配置
 * - 导航项类型定义
 */

// 导航项类型
export interface NavItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
  order: number;
  visible: boolean;
  role?: "admin" | "publisher" | "commenter"; // 可选，限制特定角色可见
}

// 默认导航配置
const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "首页", href: "/", external: false, order: 1, visible: true },
  { id: "posts", label: "文章", href: "/posts", external: false, order: 2, visible: true },
  { id: "about", label: "关于", href: "/about", external: false, order: 3, visible: true },
];

const CONFIG_KEY = "nav_config";

/**
 * 获取导航配置
 */
export async function getNavConfig(kv: KVNamespace): Promise<NavItem[]> {
  const config = await kv.get(CONFIG_KEY);
  if (!config) {
    return DEFAULT_NAV_ITEMS;
  }
  return JSON.parse(config) as NavItem[];
}

/**
 * 更新导航配置
 */
export async function updateNavConfig(kv: KVNamespace, items: NavItem[]): Promise<NavItem[]> {
  // 按 order 排序
  const sorted = [...items].sort((a, b) => a.order - b.order);
  await kv.put(CONFIG_KEY, JSON.stringify(sorted));
  return sorted;
}

/**
 * 添加导航项
 */
export async function addNavItem(kv: KVNamespace, item: Omit<NavItem, "id">): Promise<NavItem> {
  const items = await getNavConfig(kv);
  const newItem: NavItem = {
    ...item,
    id: crypto.randomUUID(),
  };
  items.push(newItem);
  await updateNavConfig(kv, items);
  return newItem;
}

/**
 * 更新导航项
 */
export async function updateNavItem(
  kv: KVNamespace,
  id: string,
  update: Partial<NavItem>,
): Promise<NavItem | null> {
  const items = await getNavConfig(kv);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  items[index] = { ...items[index], ...update };
  await updateNavConfig(kv, items);
  return items[index];
}

/**
 * 删除导航项
 */
export async function deleteNavItem(kv: KVNamespace, id: string): Promise<boolean> {
  const items = await getNavConfig(kv);
  const filtered = items.filter((item) => item.id !== id);

  if (filtered.length === items.length) {
    return false; // 未找到
  }

  await updateNavConfig(kv, filtered);
  return true;
}

/**
 * 获取可见导航项（根据用户角色过滤）
 */
export function getVisibleNavItems(items: NavItem[], userRole?: string): NavItem[] {
  return items
    .filter((item) => item.visible)
    .filter((item) => {
      if (!item.role) return true; // 无角色限制
      return userRole === item.role || userRole === "admin"; // 管理员可见所有
    })
    .sort((a, b) => a.order - b.order);
}
