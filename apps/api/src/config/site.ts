/**
 * 站点配置管理
 *
 * 功能：
 * - 获取站点配置
 * - 更新站点配置
 * - 站点配置类型定义
 */

import { adminMiddleware } from "../auth/middleware";

// 站点配置类型
export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  logo?: string;
  favicon?: string;
  keywords: string[];
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  seo: {
    enable: boolean;
    googleAnalyticsId?: string;
    googleSearchConsoleId?: string;
  };
  footer: {
    copyright: string;
    customHtml?: string;
  };
}

// 默认配置
const DEFAULT_SITE_CONFIG: SiteConfig = {
  title: "Blog",
  description: "A blog powered by Cloudflare",
  url: "https://blog.jonirrings.com",
  keywords: ["blog", "cloudflare", "nextjs", "nuxt", "sveltekit"],
  socialLinks: {},
  seo: {
    enable: true,
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Blog. All rights reserved.`,
  },
};

const CONFIG_KEY = "site_config";

/**
 * 获取站点配置
 */
export async function getSiteConfig(kv: KVNamespace): Promise<SiteConfig> {
  const config = await kv.get(CONFIG_KEY);
  if (!config) {
    return DEFAULT_SITE_CONFIG;
  }
  return JSON.parse(config) as SiteConfig;
}

/**
 * 更新站点配置
 */
export async function updateSiteConfig(
  kv: KVNamespace,
  config: Partial<SiteConfig>,
): Promise<SiteConfig> {
  const currentConfig = await getSiteConfig(kv);
  const newConfig = mergeConfig(currentConfig, config);
  await kv.put(CONFIG_KEY, JSON.stringify(newConfig));
  return newConfig;
}

/**
 * 合并配置
 */
function mergeConfig(current: SiteConfig, update: Partial<SiteConfig>): SiteConfig {
  const merged: SiteConfig = { ...current };

  if (update.title) merged.title = update.title;
  if (update.description) merged.description = update.description;
  if (update.url) merged.url = update.url;
  if (update.logo) merged.logo = update.logo;
  if (update.favicon) merged.favicon = update.favicon;
  if (update.keywords) merged.keywords = update.keywords;

  if (update.socialLinks) {
    merged.socialLinks = { ...merged.socialLinks, ...update.socialLinks };
  }

  if (update.seo) {
    merged.seo = { ...merged.seo, ...update.seo };
  }

  if (update.footer) {
    merged.footer = { ...merged.footer, ...update.footer };
  }

  return merged;
}
