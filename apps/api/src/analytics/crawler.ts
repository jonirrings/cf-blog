/**
 * 爬虫识别模块
 *
 * 功能：
 * - User-Agent 爬虫特征匹配
 * - Cloudflare CF-Bot-Score 解析
 * - 爬虫类型分类
 */

// 常见爬虫 User-Agent 特征
const BOT_PATTERNS = [
  // 搜索引擎爬虫
  { name: "google", pattern: /Googlebot|Google-Insights|Google-PageRenderer/i },
  { name: "bing", pattern: /bingbot|BingPreview/i },
  { name: "baidu", pattern: /Baiduspider|Baidu Preview/i },
  { name: "yandex", pattern: /YandexBot|YandexRender/i },
  { name: "duckduckgo", pattern: /DuckDuckBot/i },
  { name: "facebook", pattern: /facebookexternalhit|Facebot/i },
  { name: "twitter", pattern: /Twitterbot|Tweetmeme/i },
  { name: "linkedin", pattern: /LinkedInBot/i },
  // SEO 工具
  { name: "ahrefs", pattern: /AhrefsBot/i },
  { name: "semrush", pattern: /SemrushBot/i },
  { name: "majestic", pattern: /MJ12bot/i },
  // 监控工具
  { name: "uptimerobot", pattern: /UptimeRobot/i },
  { name: "pingdom", pattern: /Pingdom.com/i },
  // 通用爬虫特征
  { name: "generic", pattern: /bot|crawler|spider|scraper/i },
];

// 已知人类浏览器特征
const HUMAN_BROWSER_PATTERNS = [
  /Chrome/i,
  /Firefox/i,
  /Safari/i,
  /Edge/i,
  /Opera/i,
  /MSIE/i,
  /Trident/i,
];

export interface CrawlerDetectionResult {
  isBot: boolean;
  botName?: string;
  botType?: "search_engine" | "social_media" | "seo_tool" | "monitoring" | "generic";
  confidence: "high" | "medium" | "low";
  cfBotScore?: number;
}

/**
 * 检测是否为爬虫
 */
export function detectCrawler(
  userAgent: string | null,
  cfBotScore?: number,
): CrawlerDetectionResult {
  if (!userAgent) {
    return { isBot: false, confidence: "low" };
  }

  // 1. 优先使用 Cloudflare Bot Score
  if (cfBotScore !== undefined) {
    if (cfBotScore <= 29) {
      return {
        isBot: true,
        botName: "verified_bot",
        botType: "generic",
        confidence: "high",
        cfBotScore,
      };
    }
    if (cfBotScore <= 59) {
      return {
        isBot: true,
        botName: "likely_bot",
        botType: "generic",
        confidence: "medium",
        cfBotScore,
      };
    }
  }

  // 2. User-Agent 特征匹配
  for (const { name, pattern } of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      const botType = classifyBotType(name);
      return {
        isBot: true,
        botName: name,
        botType,
        confidence: "high",
        cfBotScore,
      };
    }
  }

  // 3. 检查是否为人类浏览器
  for (const pattern of HUMAN_BROWSER_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: false, confidence: "high", cfBotScore };
    }
  }

  // 4. 未知情况
  return { isBot: false, confidence: "low", cfBotScore };
}

/**
 * 分类爬虫类型
 */
function classifyBotType(botName: string): CrawlerDetectionResult["botType"] {
  const searchEngines = ["google", "bing", "baidu", "yandex", "duckduckgo"];
  const socialMedia = ["facebook", "twitter", "linkedin"];
  const seoTools = ["ahrefs", "semrush", "majestic"];
  const monitoring = ["uptimerobot", "pingdom"];

  if (searchEngines.includes(botName)) return "search_engine";
  if (socialMedia.includes(botName)) return "social_media";
  if (seoTools.includes(botName)) return "seo_tool";
  if (monitoring.includes(botName)) return "monitoring";
  return "generic";
}

/**
 * 从请求中获取 Bot Score
 */
export function getBotScore(request: Request): number | undefined {
  const cf = (request as any).cf;
  return cf?.botManagement?.score;
}

/**
 * 从请求中获取爬虫检测结果
 */
export function getCrawlerDetection(request: Request): CrawlerDetectionResult {
  const userAgent = request.headers.get("User-Agent");
  const cfBotScore = getBotScore(request);
  return detectCrawler(userAgent, cfBotScore);
}

/**
 * 检查请求是否应该计入访问统计
 */
export function shouldCountVisit(request: Request): boolean {
  const detection = getCrawlerDetection(request);

  // 爬虫不计入
  if (detection.isBot && detection.confidence !== "low") {
    return false;
  }

  // 监控工具不计入
  if (detection.botType === "monitoring") {
    return false;
  }

  return true;
}
