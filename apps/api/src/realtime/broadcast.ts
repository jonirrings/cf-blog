/**
 * 实时广播服务
 *
 * 功能：
 * - 评论创建/审批/拒绝广播
 * - 文章内容更新广播
 * - 新文章发布广播
 * - 在线人数统计同步
 */

import type { RoomDO } from "../websocket/RoomDO";
import type { HomeDO } from "../websocket/HomeDO";
import type { PresenceDO } from "../websocket/PresenceDO";

// 广播事件类型
export type BroadcastEventType =
  | "comment_added"
  | "comment_approved"
  | "comment_rejected"
  | "post_updated"
  | "post_published"
  | "post_deleted";

// 广播事件数据
export interface BroadcastEvent {
  type: BroadcastEventType;
  payload: Record<string, any>;
  timestamp: string;
}

/**
 * 广播事件到文章房间
 */
export async function broadcastToRoom(
  env: { ROOM_DO: DurableObjectNamespace },
  postId: string,
  event: BroadcastEvent,
): Promise<void> {
  try {
    const id = env.ROOM_DO.idFromName(postId);
    const stub = env.ROOM_DO.get(id) as unknown as {
      fetch: (request: Request) => Promise<Response>;
    };

    await stub.fetch(
      new Request("http://internal/room/broadcast", {
        method: "POST",
        body: JSON.stringify(event),
      }),
    );
  } catch (error) {
    console.error("[Broadcast] 房间广播失败:", error);
  }
}

/**
 * 广播事件到首页房间
 */
export async function broadcastToHome(
  env: { HOME_DO: DurableObjectNamespace },
  event: BroadcastEvent,
): Promise<void> {
  try {
    const id = env.HOME_DO.idFromName("home");
    const stub = env.HOME_DO.get(id) as unknown as {
      fetch: (request: Request) => Promise<Response>;
    };

    await stub.fetch(
      new Request("http://internal/home/broadcast", {
        method: "POST",
        body: JSON.stringify(event),
      }),
    );
  } catch (error) {
    console.error("[Broadcast] 首页广播失败:", error);
  }
}

/**
 * 广播新评论
 */
export async function broadcastNewComment(
  env: { ROOM_DO: DurableObjectNamespace },
  postId: string,
  comment: {
    id: number;
    userId: number;
    userName: string;
    content: string;
    createdAt: string;
  },
): Promise<void> {
  await broadcastToRoom(env, postId, {
    type: "comment_added",
    payload: comment,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 广播评论审批结果
 */
export async function broadcastCommentApproval(
  env: { ROOM_DO: DurableObjectNamespace },
  postId: string,
  commentId: number,
  approved: boolean,
): Promise<void> {
  await broadcastToRoom(env, postId, {
    type: approved ? "comment_approved" : "comment_rejected",
    payload: { commentId, approved },
    timestamp: new Date().toISOString(),
  });
}

/**
 * 广播新文章发布
 */
export async function broadcastNewPost(
  env: { HOME_DO: DurableObjectNamespace; ROOM_DO: DurableObjectNamespace },
  post: {
    id: number;
    title: string;
    slug: string;
    authorId: number;
    authorName: string;
  },
): Promise<void> {
  // 广播到首页
  await broadcastToHome(env, {
    type: "post_published",
    payload: post,
    timestamp: new Date().toISOString(),
  });

  // 可选：广播到文章自己的房间（用于通知作者）
  await broadcastToRoom(env, post.id.toString(), {
    type: "post_published",
    payload: post,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 广播文章内容更新
 */
export async function broadcastPostUpdate(
  env: { ROOM_DO: DurableObjectNamespace },
  postId: string,
  post: {
    id: number;
    title: string;
    content: string;
    updatedAt: string;
  },
): Promise<void> {
  await broadcastToRoom(env, postId, {
    type: "post_updated",
    payload: post,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 广播文章删除
 */
export async function broadcastPostDelete(
  env: { HOME_DO: DurableObjectNamespace; ROOM_DO: DurableObjectNamespace },
  postId: string,
  postId_num: number,
): Promise<void> {
  // 广播到首页
  await broadcastToHome(env, {
    type: "post_deleted",
    payload: { postId: postId_num },
    timestamp: new Date().toISOString(),
  });

  // 广播到房间（通知读者文章已删除）
  await broadcastToRoom(env, postId, {
    type: "post_deleted",
    payload: { postId: postId_num },
    timestamp: new Date().toISOString(),
  });
}
