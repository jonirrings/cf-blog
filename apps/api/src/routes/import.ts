/**
 * 导入/导出相关 API 路由
 *
 * - POST /api/import/ghost - Ghost JSON 导入
 * - POST /api/import/markdown - Markdown 导入
 * - GET /api/export/ghost - Ghost JSON 导出
 * - GET /api/export/markdown/:id - Markdown 导出
 * - GET /api/export/zip - ZIP 批量导出
 */

import { Hono } from "hono";
import type { Env } from "../index";

const app = new Hono<{ Bindings: Env }>();

// Ghost JSON 导入
app.post("/ghost", async (c) => {
  return c.json({ error: "Not Implemented" }, 501);
});

// Markdown 导入
app.post("/markdown", async (c) => {
  return c.json({ error: "Not Implemented" }, 501);
});

// Ghost JSON 导出
app.get("/ghost", async (c) => {
  return c.json({ error: "Not Implemented" }, 501);
});

// Markdown 导出
app.get("/markdown/:id", async (c) => {
  return c.json({ error: "Not Implemented" }, 501);
});

// ZIP 批量导出
app.get("/zip", async (c) => {
  return c.json({ error: "Not Implemented" }, 501);
});

export default app;
