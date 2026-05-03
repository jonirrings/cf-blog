/**
 * XSS 防护模块 - 输入清理和消毒
 *
 * 功能：
 * - HTML 标签过滤
 * - JavaScript 协议过滤
 * - 事件处理器过滤
 * - 评论输入清理
 */

// 允许的 HTML 标签白名单（用于富文本内容）
const ALLOWED_TAGS = new Set([
  'b',
  'i',
  'em',
  'strong',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'p',
  'br',
  'blockquote',
  'code',
  'pre',
]);

// 允许的属性白名单
const ALLOWED_ATTRIBUTES = new Set(['href', 'rel', 'target', 'title', 'class', 'id']);

// 危险的协议
const DANGEROUS_PROTOCOLS = ['javascript:', 'vbscript:', 'data:', 'file:'];

/**
 * 清理 HTML 标签（简单实现）
 * 生产环境建议使用 DOMPurify 或 isomorphic-dompurify
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';

  let sanitized = html;

  // 移除 script 标签
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 移除 style 标签
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 移除 on* 事件处理器
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  // 移除 javascript: 协议
  DANGEROUS_PROTOCOLS.forEach((protocol) => {
    const regex = new RegExp(protocol, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized;
}

/**
 * 清理文本输入（用于评论等用户输入）
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  // HTML 实体编码
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 解码 HTML 实体
 */
export function decodeHTML(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };

  return text.replace(/&[^;]+;/g, (match) => entities[match] || match);
}

/**
 * 验证并清理 URL
 */
export function sanitizeURL(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * 清理 Markdown 输入中的危险内容
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return '';

  let sanitized = markdown;

  // 移除 HTML 标签（保留允许的）
  sanitized = sanitized.replace(
    /<(?!\/?(b|i|em|strong|u|a|ul|ol|li|p|br|blockquote|code|pre)\b)[^>]*>/gi,
    ''
  );

  // 移除 javascript: 链接
  sanitized = sanitized.replace(/\[([^\]]*)\]\(javascript:[^)]*\)/gi, '$1');

  // 移除图片（不允许在评论中使用图片）
  sanitized = sanitized.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');

  return sanitized;
}

/**
 * 验证评论输入
 */
export function validateCommentInput(content: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: '评论内容不能为空' };
  }

  if (content.length > 1000) {
    return { valid: false, error: '评论内容超过 1000 字符限制' };
  }

  // 统计链接数量
  const linkCount = (content.match(/\[([^\]]*)\]\([^)]*\)/g) || []).length;
  if (linkCount > 3) {
    return { valid: false, error: '评论中最多允许 3 个链接' };
  }

  // 清理内容
  const sanitized = sanitizeMarkdown(content);

  return { valid: true, sanitized };
}

/**
 * 转义正则表达式特殊字符
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 过滤敏感词（简单实现）
 */
export function filterSensitiveWords(
  text: string,
  sensitiveWords: string[],
  replacement = '***'
): string {
  let result = text;
  for (const word of sensitiveWords) {
    const regex = new RegExp(escapeRegExp(word), 'gi');
    result = result.replace(regex, replacement);
  }
  return result;
}
