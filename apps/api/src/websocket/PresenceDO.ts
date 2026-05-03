/**
 * Presence Durable Object - 全局在线人数统计
 *
 * 功能：
 * - 维护全局在线用户集合
 * - 心跳检测（15 秒间隔）
 * - 过期连接清理（30 秒超时）
 * - 广播在线人数变化
 */

export interface PresenceState {
  connections: Map<string, { userId?: string; lastSeen: number }>;
  heartbeatInterval?: number;
}

export class PresenceDO {
  private state: DurableObjectState;
  private env: any;
  private connections: Map<string, { userId?: string; lastSeen: number }> = new Map();
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

    // HTTP API - 获取在线人数
    if (url.pathname === '/presence/count' && request.method === 'GET') {
      return new Response(JSON.stringify({ count: this.connections.size }), {
        headers: { 'Content-Type': 'application/json' },
      });
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

    // 记录连接
    this.connections.set(sessionId, {
      userId: userId ?? undefined,
      lastSeen: Date.now(),
    });

    // 广播人数变化
    this.broadcastPresence();

    // 启动心跳检测
    this.startHeartbeat();

    // 发送初始在线人数
    const initialData = JSON.stringify({
      type: 'presence:init',
      count: this.connections.size,
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
        case 'presence:heartbeat': {
          // 更新心跳
          const sessionId = data.sessionId;
          if (sessionId && this.connections.has(sessionId)) {
            this.connections.get(sessionId)!.lastSeen = Date.now();
          }
          break;
        }

        case 'presence:subscribe':
          // 订阅更新
          ws.send(
            JSON.stringify({
              type: 'presence:update',
              count: this.connections.size,
            })
          );
          break;
      }
    } catch (error) {
      console.error('[PresenceDO] Message parse error:', error);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    // 查找并移除连接
    let removedSessionId: string | undefined;
    for (const [sessionId, info] of this.connections.entries()) {
      // 简单匹配：关闭的 ws 对应最早未确认的连接
      // 实际场景可通过 sessionId 精确匹配
      removedSessionId = sessionId;
      break;
    }

    if (removedSessionId) {
      this.connections.delete(removedSessionId);
      this.broadcastPresence();
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 30000; // 30 秒超时

      // 清理过期连接
      for (const [sessionId, info] of this.connections.entries()) {
        if (now - info.lastSeen > timeout) {
          this.connections.delete(sessionId);
        }
      }

      // 广播更新
      this.broadcastPresence();

      // 如果没有连接，停止心跳
      if (this.connections.size === 0 && this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = undefined;
      }
    }, 15000); // 15 秒间隔
  }

  private broadcastPresence(): void {
    const message = JSON.stringify({
      type: 'presence:update',
      count: this.connections.size,
      timestamp: new Date().toISOString(),
    });

    // 广播给所有连接的客户端
    const webSockets = this.state.getWebSockets();
    for (const ws of webSockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }
}
