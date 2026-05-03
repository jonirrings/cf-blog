import { sqliteTable, text, integer, relations, primaryKey, uniqueKey } from 'drizzle-orm/sqlite-core';

// ==================== 认证相关表 ====================

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  githubId: text('github_id').unique(),  // GitHub OAuth ID
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  passwordHash: text('password_hash'),  // 邮箱密码登录的哈希密码
  role: text('role', { enum: ['admin', 'publisher', 'commenter'] }).notNull(),

  // 用户审批状态
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false).notNull(),  // 管理员是否审批通过

  // 角色升级申请
  publisherApplicationStatus: text('publisher_application_status', {
    enum: ['none', 'pending', 'approved', 'rejected'],
  }).default('none').notNull(),
  publisherApplicationReason: text('publisher_application_reason'),  // 申请理由
  publisherApplicationReviewedAt: text('publisher_application_reviewed_at'),
  publisherApplicationReviewedBy: integer('publisher_application_reviewed_by').references(() => users.id),
  publisherApplicationRejectReason: text('publisher_application_reject_reason'),

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  lastLoginAt: text('last_login_at'),
});

export const passkeys = sqliteTable('passkeys', {
  id: text('id').primaryKey(),  // credential ID (base64)
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name'),  // 设备名称，如 "MacBook Pro"
  publicKey: text('public_key').notNull(),  // PEM 格式
  counter: integer('counter').notNull().default(0),  // 防止重放攻击
  createdAt: text('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),  // session token
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

// ==================== 博客内容表 ====================

export const authors = sqliteTable('authors', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),  // 关联用户
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  createdAt: text('created_at').notNull(),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  status: text('status', { enum: ['draft', 'published'] }).default('draft').notNull(),
  framework: text('framework', { enum: ['next', 'nuxt', 'svelte'] }).notNull(),
  authorId: integer('author_id').references(() => authors.id),

  // 访问统计（冗余字段，快速查询）
  viewCount: integer('view_count').notNull().default(0),  // 总阅读数
  uniqueViewCount: integer('unique_view_count').notNull().default(0),  // 独立访客数

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  publishedAt: text('published_at'),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
});

export const postsToTags = sqliteTable('posts_to_tags', {
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey(t.postId, t.tagId),
}));

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),

  // 二级审批机制
  userApproved: integer('user_approved', { mode: 'boolean' }).default(false).notNull(),  // 管理员审批用户
  postApproved: integer('post_approved', { mode: 'boolean' }).default(false).notNull(),  // 文章作者审批内容
  rejected: integer('rejected', { mode: 'boolean' }).default(false).notNull(),  // 评论被拒绝

  // 审批元数据
  userApprovedAt: text('user_approved_at'),
  userApprovedBy: integer('user_approved_by').references(() => users.id),  // 管理员
  postApprovedAt: text('post_approved_at'),
  postApprovedBy: integer('post_approved_by').references(() => users.id),  // 文章作者
  rejectedAt: text('rejected_at'),
  rejectedBy: integer('rejected_by').references(() => users.id),
  rejectReason: text('reject_reason'),

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ==================== 访问统计表 ====================

export const postViews = sqliteTable('post_views', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),

  // 访问者标识（用于去重）
  sessionId: text('session_id').notNull(),  // 前端生成的 UUID
  ipAddress: text('ip_address').notNull(),  // 脱敏存储（哈希）
  userAgent: text('user_agent'),

  // 访问来源
  referer: text('referer'),
  country: text('country'),  // Cloudflare CF-IPCountry
  city: text('city'),

  // 爬虫标识
  isBot: integer('is_bot', { mode: 'boolean' }).notNull().default(false),
  botType: text('bot_type'),  // 'google', 'bing', 'other', null

  // 数据来源
  source: text('source', { enum: ['self', 'cloudflare'] }).notNull().default('self'),

  // 时间
  viewedAt: text('viewed_at').notNull(),
});

export const postViewStats = sqliteTable('post_view_stats', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(),  // YYYY-MM-DD

  totalViews: integer('total_views').notNull().default(0),
  uniqueViews: integer('unique_views').notNull().default(0),
  botViews: integer('bot_views').notNull().default(0),
}, (t) => ({
  uniqueKey: uniqueKey(t.postId, t.date),
}));

// ==================== 审计日志表 ====================

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),  // 如 'USER_APPROVED', 'COMMENT_REJECTED'
  resource: text('resource').notNull(),  // 如 'user:123', 'comment:456'
  resourceType: text('resource_type').notNull(),  // 'user' | 'comment' | 'post' | 'application'
  resourceId: integer('resource_id').notNull(),

  // 上下文信息
  ipAddress: text('ip_address'),  // 请求 IP
  userAgent: text('user_agent'),
  metadata: text('metadata'),  // JSON 字符串，存储额外信息

  // 结果
  success: integer('success', { mode: 'boolean' }).notNull(),
  errorMessage: text('error_message'),

  timestamp: text('timestamp').notNull(),
});

// ==================== 关系定义 ====================

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.id],
  }),
  tags: many(postsToTags),
  comments: many(comments),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsToTags),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  passkeys: many(passkeys),
  sessions: many(sessions),
  comments: many(comments),
}));

// ==================== 类型导出 ====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Passkey = typeof passkeys.$inferSelect;
export type NewPasskey = typeof passkeys.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type UserRole = 'admin' | 'publisher' | 'commenter';
export type PublisherApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type PostView = typeof postViews.$inferSelect;
export type NewPostView = typeof postViews.$inferInsert;
export type PostViewStats = typeof postViewStats.$inferSelect;
export type NewPostViewStats = typeof postViewStats.$inferInsert;

// 评论可见性枚举
export type CommentVisibility = 'owner_only' | 'owner_and_author' | 'public' | 'owner_and_admin';

// 审计动作枚举
export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_REGISTER'
  | 'USER_APPROVED'
  | 'USER_REJECTED'
  | 'USER_ROLE_CHANGED'
  | 'COMMENT_CREATED'
  | 'COMMENT_USER_APPROVED'
  | 'COMMENT_POST_APPROVED'
  | 'COMMENT_REJECTED'
  | 'PUBLISHER_APPLICATION_SUBMITTED'
  | 'PUBLISHER_APPLICATION_APPROVED'
  | 'PUBLISHER_APPLICATION_REJECTED'
  | 'POST_CREATED'
  | 'POST_DELETED';

// 爬虫类型枚举
export type BotType = 'google' | 'bing' | 'baidu' | 'yandex' | 'duckduck' | 'facebook' | 'twitter' | 'linkedin' | 'slack' | 'other' | 'suspected';
