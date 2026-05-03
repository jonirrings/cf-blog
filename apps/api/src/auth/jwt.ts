/**
 * JWT 工具函数
 *
 * 使用 Web Crypto API 实现 JWT 签名和验证
 */

const JWT_SECRET_KEY = 'JWT_SECRET'; // KV 中的 key
const ALGORITHM = { name: 'HMAC', hash: 'SHA-256' };

/**
 * 从 KV 获取或生成 JWT 密钥
 */
async function getJwtKey(kv: KVNamespace): Promise<CryptoKey> {
  let secret = await kv.get(JWT_SECRET_KEY, 'text');

  if (!secret) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    secret = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    await kv.put(JWT_SECRET_KEY, secret);
  }

  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', keyData, ALGORITHM, false, ['sign', 'verify']);
}

/**
 * Base64URL 编码
 */
function base64UrlEncode(ArrayBuffer): string {
  const bytes = new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Base64URL 解码
 */
function base64UrlDecode(str: string): Uint8Array {
  let binary = atob(
    str
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(str.length + ((4 - (str.length % 4)) % 4), '=')
  );
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * 生成 JWT Token
 */
export async function sign(
  payload: { userId: number; userEmail: string; userName: string; userRole: string },
  kv: KVNamespace,
  expiresInSeconds: number = 7 * 24 * 60 * 60
): Promise<string> {
  const key = await getJwtKey(kv);
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'HS256', typ: 'JWT' };
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const headerEncoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const bodyEncoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(body)));

  const data = new TextEncoder().encode(`${headerEncoded}.${bodyEncoded}`);
  const signature = await crypto.subtle.sign(ALGORITHM, key, data);
  const signatureEncoded = base64UrlEncode(signature);

  return `${headerEncoded}.${bodyEncoded}.${signatureEncoded}`;
}

/**
 * 验证 JWT Token
 */
export async function verify(
  token: string,
  kv: KVNamespace
): Promise<{
  userId: number;
  userEmail: string;
  userName: string;
  userRole: string;
  exp: number;
} | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerEncoded, bodyEncoded, signatureEncoded] = parts;
    const key = await getJwtKey(kv);

    const data = new TextEncoder().encode(`${headerEncoded}.${bodyEncoded}`);
    const signature = base64UrlDecode(signatureEncoded);

    const isValid = await crypto.subtle.verify(ALGORITHM, key, signature, data);
    if (!isValid) {
      return null;
    }

    const body = JSON.parse(new TextDecoder().decode(base64UrlDecode(bodyEncoded)));

    if (body.exp && Date.now() / 1000 > body.exp) {
      return null;
    }

    return {
      userId: body.userId,
      userEmail: body.userEmail,
      userName: body.userName,
      userRole: body.userRole,
      exp: body.exp,
    };
  } catch (error) {
    console.error('[JWT] 验证失败:', error);
    return null;
  }
}

export function decode(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const bodyEncoded = parts[1];
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(bodyEncoded)));
  } catch (error) {
    console.error('[JWT] 解码失败:', error);
    return null;
  }
}
