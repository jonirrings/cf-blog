/**
 * Home Durable Object - 首页房间广播
 *
 * 功能：
 * - 新文章发布通知
 * - 首页访问人数统计
 * - 全局公告广播
 */

export interface HomeState {
  visitors: Map<string, { userId?: string; lastSeen: number }>;
  heartbeatInterval?: number;
}

export class HomeDO {
  private state: DurableObjectState;
  private env: any;
  private visitors: Map<string, { userId?: string; lastSeen: number }> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket 升级请求
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // HTTP API - 获取访问人数
    if (url.pathname === '/home/visitors' && request.method === 'GET') {
      return new Response(JSON.stringify({ count: this.visitors.size }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // HTTP API - 广播新文章通知（内部调用）
    if (url.pathname === '/home/broadcast' && request.method === 'POST') {
      const body = await request.json<any>();
      this.broadcastNewPost(body);
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

    // 记录访问者
    this.visitors.set(sessionId, {
      userId: userId ?? undefined,
      lastSeen: Date.now(),
    });

    // 广播人数变化
    this.broadcastVisitorCount();

    // 启动心跳检测
    this.startHeartbeat();

    // 发送初始数据
    const initialData = JSON.stringify({
      type: 'home:init',
      visitorCount: this.visitors.size,
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
        case 'home:heartbeat': {
          const sessionId = data.sessionId;
          if (sessionId && this.visitors.has(sessionId)) {
            this.visitors.get(sessionId)!.lastSeen = Date.now();
          }
          break;
        }
      }
    } catch (error) {
      console.error('[HomeDO] Message parse error:', error);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    let removedSessionId: string | undefined;
    for (const [sessionId] of this.visitors.entries()) {
      removedSessionId = sessionId;
      break;
    }

    if (removedSessionId) {
      this.visitors.delete(removedSessionId);
      this.broadcastVisitorCount();
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 30000;

      for (const [sessionId, visitor] of this.visitors.entries()) {
        if (now - (visitor.lastSeen ?? 0) > timeout) {
          this.visitors.delete(sessionId);
        }
      }

      this.broadcastVisitorCount();

      if (this.visitors.size === 0 && this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = undefined;
      }
    }, 15000);
  }

  public broadcastNewPost(post: { id: string; title: string; slug: string }): void {
    const message = JSON.stringify({
      type: 'home:newPost',
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
      },
      timestamp: new Date().toISOString(),
    });

    const webSockets = this.state.getWebSockets();
    for (const ws of webSockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  private broadcastVisitorCount(): void {
    const message = JSON.stringify({
      type: 'home:visitorCount',
      count: this.visitors.size,
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
