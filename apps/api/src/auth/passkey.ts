/**
 * Passkey (WebAuthn) 认证模块
 *
 * 功能：
 * - 生成注册挑战
 * - 验证注册响应
 * - 生成登录挑战
 * - 验证登录响应
 * - Passkey 管理（添加/删除）
 */

import { eq } from "drizzle-orm";
import { users, passkeys } from "@cf-blog/db/schema";
import type { NewPasskey } from "@cf-blog/db/schema";

// WebAuthn 配置
const RP_NAME = "Blog";
const RP_ID = "blog.jonirrings.com"; // 生产环境修改为实际域名
const ORIGIN = "https://blog.jonirrings.com";

/**
 * 生成注册挑战
 */
export async function generateRegistrationOptions(userId: number, userName: string): Promise<any> {
  // 注意：实际使用需要引入 @simplewebauthn/server
  // 这里提供简化实现
  return {
    challenge: crypto.randomUUID(),
    rp: {
      name: RP_NAME,
      id: RP_ID,
    },
    user: {
      id: userId.toString(),
      name: userName,
      displayName: userName,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    timeout: 60000,
    attestation: "none",
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  };
}

/**
 * 验证注册响应
 */
export async function verifyRegistrationResponse(
  userId: number,
  response: any,
  challenge: string,
): Promise<{ success: boolean; passkey?: NewPasskey; error?: string }> {
  try {
    // 注意：实际使用需要引入 @simplewebauthn/server 进行验证
    // 这里提供简化实现

    const { id, rawId, response: attestationResponse } = response;

    if (!id || !attestationResponse) {
      return { success: false, error: "无效的响应数据" };
    }

    // 创建 Passkey 记录
    const passkey: NewPasskey = {
      userId,
      credentialId: id,
      publicKey: Buffer.from(JSON.stringify(response)).toString("base64"),
      counter: 0,
      deviceType: "singleDevice",
      backedUp: false,
      transports: attestationResponse.transports?.join(",") || null,
      createdAt: new Date(),
    };

    return { success: true, passkey };
  } catch (error) {
    console.error("[Passkey] 注册验证失败:", error);
    return { success: false, error: "验证失败" };
  }
}

/**
 * 生成登录挑战
 */
export async function generateAuthenticationOptions(
  allowCredentials?: Array<{ id: string; type: string }>,
): Promise<any> {
  return {
    challenge: crypto.randomUUID(),
    timeout: 60000,
    rpId: RP_ID,
    allowCredentials: allowCredentials || [],
    userVerification: "preferred",
  };
}

/**
 * 验证登录响应
 */
export async function verifyAuthenticationResponse(
  response: any,
  challenge: string,
  passkey: any,
): Promise<{ success: boolean; userId?: number; error?: string }> {
  try {
    const { id, response: authResponse, type } = response;

    if (!id || !authResponse) {
      return { success: false, error: "无效的响应数据" };
    }

    // 解析 authenticatorData
    const authenticatorData = Buffer.from(authResponse.authenticatorData, "base64");
    const clientDataJSON = Buffer.from(authResponse.clientDataJSON, "base64");

    // 验证 challenge
    const clientData = JSON.parse(new TextDecoder().decode(clientDataJSON));
    if (clientData.challenge !== challenge) {
      return { success: false, error: "Challenge 不匹配" };
    }

    // 验证 origin
    if (clientData.origin !== ORIGIN) {
      return { success: false, error: "Origin 不匹配" };
    }

    // 验证 token binding
    if (clientData.tokenBinding && clientData.tokenBinding.status !== "not-supported") {
      return { success: false, error: "Token binding 不支持" };
    }

    // 解析 authenticator data
    const rpIdHash = authenticatorData.slice(0, 32);
    const flags = authenticatorData[32];
    const counterBuffer = authenticatorData.slice(33, 37);
    const counter = counterBuffer.readUInt32BE(0);

    // 验证 RP ID hash
    const expectedRpIdHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(RP_ID));
    const rpIdHashBuffer = Buffer.from(expectedRpIdHash);
    if (!rpIdHash.equals(rpIdHashBuffer)) {
      return { success: false, error: "RP ID 验证失败" };
    }

    // 验证 flags (UV 和 BE 位)
    const hasUserVerification = (flags & 0x04) !== 0;
    const hasBackedUp = (flags & 0x08) !== 0;
    if (!hasUserVerification) {
      console.warn("[Passkey] 缺少用户验证");
    }

    // 验证 counter（防止重放攻击）
    if (counter <= passkey.counter) {
      return { success: false, error: "Counter 异常，可能存在重放攻击" };
    }

    // 验证签名
    const signature = Buffer.from(authResponse.signature, "base64");
    const signedData = Buffer.concat([authenticatorData, clientDataJSON]);

    // 解析公钥
    const publicKeyPem = passkey.publicKey;
    const publicKeyDer = Buffer.from(publicKeyPem, "base64");

    try {
      const cryptoKey = await crypto.subtle.importKey(
        "spki",
        publicKeyDer,
        {
          name: "ECDSA",
          namedCurve: "P-256",
        },
        true,
        ["verify"],
      );

      const isValid = await crypto.subtle.verify(
        {
          name: "ECDSA",
          hash: "SHA-256",
        },
        cryptoKey,
        signature,
        signedData,
      );

      if (!isValid) {
        return { success: false, error: "签名验证失败" };
      }
    } catch (verifyError) {
      console.error("[Passkey] 签名验证失败:", verifyError);
      return { success: false, error: "签名验证失败" };
    }

    return { success: true, userId: passkey.userId };
  } catch (error) {
    console.error("[Passkey] 登录验证失败:", error);
    return { success: false, error: "验证失败" };
  }
}

/**
 * 获取用户的 Passkeys
 */
export async function getUserPasskeys(db: any, userId: number): Promise<any[]> {
  return db.query.passkeys.findMany({
    where: eq(passkeys.userId, userId),
  });
}

/**
 * 保存 Passkey
 */
export async function savePasskey(db: any, passkey: NewPasskey): Promise<boolean> {
  try {
    await db.insert(passkeys).values(passkey);
    return true;
  } catch (error) {
    console.error("[Passkey] 保存失败:", error);
    return false;
  }
}

/**
 * 删除 Passkey
 */
export async function deletePasskey(db: any, credentialId: string): Promise<boolean> {
  try {
    await db.delete(passkeys).where(eq(passkeys.credentialId, credentialId));
    return true;
  } catch (error) {
    console.error("[Passkey] 删除失败:", error);
    return false;
  }
}

/**
 * 通过 Credential ID 获取 Passkey
 */
export async function getPasskeyByCredentialId(db: any, credentialId: string): Promise<any> {
  return db.query.passkeys.findFirst({
    where: eq(passkeys.credentialId, credentialId),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          name: true,
          role: true,
          isApproved: true,
        },
      },
    },
  });
}

/**
 * 生成挑战并存储到 KV（用于后续验证）
 */
export async function createChallenge(kv: KVNamespace, userId?: string): Promise<string> {
  const challenge = crypto.randomUUID();
  const key = `challenge:${challenge}`;
  const value = userId || "anonymous";

  // 存储 5 分钟
  await kv.put(key, value, { expirationTtl: 300 });

  return challenge;
}

/**
 * 验证挑战
 */
export async function verifyChallenge(
  kv: KVNamespace,
  challenge: string,
): Promise<{ valid: boolean; userId?: string }> {
  const key = `challenge:${challenge}`;
  const value = await kv.get(key);

  if (!value) {
    return { valid: false };
  }

  // 验证后删除挑战
  await kv.delete(key);

  return { valid: true, userId: value === "anonymous" ? undefined : value };
}
