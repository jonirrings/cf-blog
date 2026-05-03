/**
 * Room Durable Object - 文章房间广播
 *
 * 功能：
 * - 每篇文章一个房间
 * - 文章阅读人数统计
 * - 评论更新广播
 * - 文章内容更新广播
 */

export interface RoomState {
  postId: string;
  readers: Map<string, { userId?: string; lastSeen: number }>;
  heartbeatInterval?: number;
}

export class RoomDO {
  private state: DurableObjectState;
  private env: any;
  private readers: Map<string, { userId?: string; lastSeen: number }> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;
  private postId: string = 'unknown';

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    this.postId = url.searchParams.get('postId') || 'default';

    // WebSocket 升级请求
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // HTTP API - 获取阅读人数
    if (url.pathname === '/room/readers' && request.method === 'GET') {
      return new Response(JSON.stringify({ postId: this.postId, count: this.readers.size }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // HTTP API - 广播事件（内部调用）
    if (url.pathname === '/room/broadcast' && request.method === 'POST') {
      const body = await request.json<any>();
      this.broadcastEvent(body);
      return new Response(JSON.stringify({ success: true }));
    }

    return new Response('Not Found', { status: 404 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const { 0: client, 1: server } = new WebSocketPair();

    this.state.acceptWebSocket(server);

    // 解析连接信息
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId') || `anon-${Date.now()}`;
    const userId = url.searchParams.get('userId');

    // 记录读者
    this.readers.set(sessionId, {
      userId: userId ?? undefined,
      lastSeen: Date.now(),
    });

    // 广播人数变化
    this.broadcastReaderCount();

    // 启动心跳检测
    this.startHeartbeat();

    // 发送初始数据
    const initialData = JSON.stringify({
      type: 'room:init',
      postId: this.postId,
      readerCount: this.readers.size,
      sessionId,
    });
    server.send(initialData);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return;

    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'room:heartbeat': {
          const sessionId = data.sessionId;
          if (sessionId && this.readers.has(sessionId)) {
            this.readers.get(sessionId)!.lastSeen = Date.now();
          }
          break;
        }
      }
    } catch (error) {
      console.error('[RoomDO] Message parse error:', error);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    let removedSessionId: string | undefined;
    for (const [sessionId] of this.readers.entries()) {
      removedSessionId = sessionId;
      break;
    }

    if (removedSessionId) {
      this.readers.delete(removedSessionId);
      this.broadcastReaderCount();
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 30000;

      for (const [sessionId, reader] of this.readers.entries()) {
        if (now - (reader.lastSeen ?? 0) > timeout) {
          this.readers.delete(sessionId);
        }
      }

      this.broadcastReaderCount();

      if (this.readers.size === 0 && this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = undefined;
      }
    }, 15000);
  }

  public broadcastEvent(event: { type: string; payload?: any }): void {
    const message = JSON.stringify({
      type: 'room:event',
      event: event.type,
      payload: event.payload,
      timestamp: new Date().toISOString(),
    });

    const webSockets = this.state.getWebSockets();
    for (const ws of webSockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  private broadcastReaderCount(): void {
    const message = JSON.stringify({
      type: 'room:readerCount',
      count: this.readers.size,
      postId: this.postId,
      timestamp: new Date().toISOString(),
    });

    const webSockets = this.state.getWebSockets();
    for (const ws of webSockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }
}
