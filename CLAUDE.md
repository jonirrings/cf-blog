# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloudflare-based multi-framework blog platform using:
- **Backend**: Cloudflare Workers (Hono framework) + D1 Database + KV Storage + R2
- **Frontend**: 5 frameworks - Next.js, Nuxt, SvelteKit, SolidStart, Astro
- **ORM**: Drizzle ORM with SQLite schema
- **Auth**: JWT sessions, WebAuthn/Passkey support, email+password with SHA-256 hashing
- **i18n**: Shared `@cf-blog/i18n` package (i18next-based), supports zh-CN and en locales
- **Auth UI**: Shared `@cf-blog/auth-ui` package (React components for login/register/passkey/github)

## Commands

```bash
# Development
pnpm dev                    # Start all apps in parallel
pnpm dev -F <package>       # Start specific package (e.g., @cf-blog/api, next-blog)

# Database
pnpm db:migrate            # Generate and apply migrations
pnpm db:migrate:local      # Apply migrations to local D1
pnpm db:seed               # Seed local database
pnpm db:seed:clear         # Clear local database
pnpm db:studio             # Open Drizzle Studio

# Build & Deploy
pnpm build                 # Build all apps (runs db build first)
pnpm deploy                # Deploy to Cloudflare Pages

# Testing
pnpm test                  # Run unit + E2E tests
pnpm test:unit             # Run unit tests (vitest)
pnpm test:e2e              # Run E2E tests (playwright)
pnpm test:e2e:ui           # Run E2E tests with UI

# Type Checking
pnpm typecheck             # Check all packages
```

## Architecture

### Monorepo Structure (pnpm workspaces)

```
cf/
├── apps/
│   ├── api/               # Cloudflare Workers backend (Hono)
│   ├── next-blog/         # Next.js 16+ App Router
│   ├── nuxt-blog/         # Nuxt 3
│   ├── svelte-blog/       # SvelteKit 2 + Svelte 5
│   ├── solid-blog/        # SolidStart
│   ├── astro-blog/        # Astro 5
│   └── shell/             # Main Workers entry point
├── packages/
│   ├── db/                # Shared Drizzle schema + migrations
│   ├── i18n/              # Shared i18n (i18next, zh-CN + en)
│   └── auth-ui/           # Shared auth React components (LoginForm, RegisterForm, etc.)
└── scripts/               # Seed scripts, utilities
```

### Shared Packages

#### `@cf-blog/i18n` — Internationalization

- **Location**: `packages/i18n/src/`
- **Engine**: i18next with flat key structure (`nav.home`, `post.title`, etc.)
- **Locales**: `zh-CN` (default), `en`
- **Translation file**: `packages/i18n/src/translations.ts` — single source of truth for all keys
- **Usage per framework**:
  - **Next.js**: `useTranslation()` hook from `@cf-blog/i18n/react`
  - **Nuxt**: `useI18n()` composable from `composables/useI18n.ts`
  - **SvelteKit**: `$t()` from `src/lib/i18n.ts` (Svelte store)
  - **SolidStart**: `useTranslation()` from `src/lib/i18n.ts` (Solid signals)
  - **Astro**: Server-side `i18n.t()` + `define:vars` for client hydration
- **Adding new keys**: Add to both `zhCN` and `en` objects in `translations.ts`, and to the `TranslationKey` type union
- **Key naming**: `module.submodule.item` (e.g., `post.status.draft`, `auth.loginTitle`, `admin.quickActions.newPost`)

#### `@cf-blog/auth-ui` — Shared Auth Components

- **Location**: `packages/auth-ui/src/`
- **Components**: `LoginForm`, `RegisterForm`, `GitHubButton`, `PasskeyButton`, `AuthLayout`
- **Framework**: React (used directly by Next.js and Astro via React islands)
- **Other frameworks**: Nuxt/Svelte/Solid implement auth UI natively
- **Props**: All text is i18n'd via `@cf-blog/i18n`; `apiBaseUrl` prop for API endpoint

### pnpm Catalog

Shared dependency versions are managed via `pnpm-workspace.yaml` catalog:

```yaml
catalog:
  react: ^19.1.0
  react-dom: ^19.1.0
  next: ^16.2.4
  typescript: ^6.0.3
  '@types/node': ^24.0.0
  tailwindcss: ^4.2.4
  '@tailwindcss/postcss': ^4.2.4
  i18next: ^26.0.8
  # ... TipTap, Lucide, testing libs, etc.
```

Use `catalog:` in package.json instead of hardcoded versions for catalog-managed deps.

### Backend Routes (`apps/api/src/routes/`)

| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/api/stats` | GET | Dashboard statistics | No |
| `/api/auth/login` | POST | Email+password login | No |
| `/api/auth/register` | POST | User registration | No |
| `/api/auth/session` | GET | Current session | No |
| `/api/auth/logout` | POST | Logout | Yes |
| `/api/auth/passkey-*` | POST | WebAuthn operations | No |
| `/api/posts` | GET/POST/PUT/DELETE | Post CRUD | Publisher/Admin |
| `/api/comments` | GET/POST/PUT/DELETE | Comment CRUD | Varies |
| `/api/users` | GET/PUT | User management | Admin |
| `/api/seed` | POST | Database seeding | Dev only |

### Authentication Flow

1. **Registration**: User registers → `isApproved=false` → redirected to `/auth/pending`
2. **Approval**: Admin approves user via `/api/users` → user can log in
3. **Login**: Email+password or Passkey → JWT session stored in KV
4. **Middleware**: `authMiddleware` validates JWT, attaches session to context

### Middleware Chain (`apps/api/src/auth/middleware.ts`)

```
authMiddleware     → Validates JWT, sets c.session
  └─ adminMiddleware    → Requires role='admin'
  └─ publisherMiddleware → Requires role='admin' or 'publisher'
```

### Database Schema Highlights (`packages/db/src/schema.ts`)

- **users**: `id, email, name, passwordHash, role, isApproved, ...`
- **posts**: `id, slug, title, content, status, authorId, viewCount, ...`
- **comments**: `id, postId, userId, content, userApproved, postApproved, rejected, ...`
- **sessions**: `id (token), userId, expiresAt` (KV storage)
- **passkeys**: `id (credential), userId, publicKey, counter`

### Frontend Routes

All 5 frameworks share the same route structure:

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Home page (post list) | No |
| `/post/[slug]` | Post detail | No |
| `/auth/login` | Login page | No |
| `/auth/register` | Registration page | No |
| `/auth/pending` | Pending approval page | No |
| `/admin/dashboard` | Stats overview | Admin |
| `/admin/posts` | Post management | Admin/Publisher |
| `/admin/posts/new` | Create post | Admin/Publisher |
| `/admin/posts/edit/[id]` | Edit post | Admin/Publisher |
| `/admin/comments` | Comment moderation | Admin |
| `/admin/users` | User management | Admin |
| `/admin/settings` | Site settings | Admin |

### Admin Layout

All 5 frameworks implement an admin layout with:
- **Auth guard**: Fetches `/api/auth/session`, redirects to `/auth/login` if unauthenticated, redirects to `/` if non-admin
- **Sidebar navigation**: Dashboard, Posts, Comments, Users, Settings
- **Language switcher**: Dropdown to switch between zh-CN and en (persisted via cookie)
- **User info**: Displays logged-in user name, email, and logout button

### Rich Text Editor

All 5 frameworks use **TipTap** (not Novel) with the same extension set:
- `@tiptap/starter-kit` — Base editing functionality
- `@tiptap/extension-placeholder` — Placeholder text
- `@tiptap/extension-image` — Image support
- `@tiptap/extension-link` — Link support

These are managed via the pnpm catalog for version consistency.

## Key Patterns

### i18n Usage

```typescript
// Adding a new translation key:
// 1. Add to TranslationKey type in packages/i18n/src/translations.ts
// 2. Add to zhCN object: 'my.newKey': '中文值'
// 3. Add to en object: 'my.newKey': 'English value'

// Next.js (Client Component):
import { useTranslation } from '@cf-blog/i18n/react';
const { t } = useTranslation();
return <h1>{t('post.title')}</h1>;

// Next.js (Server Component):
import i18n from '@cf-blog/i18n';
return <h1>{i18n.t('post.title')}</h1>;

// Nuxt:
const { t, locale } = useI18n();
// In template: {{ t('post.title') }}

// SvelteKit:
import { t } from '$lib/i18n';
// In template: {$t('post.title')} or {t('post.title')}

// SolidStart:
import { useTranslation } from '~/lib/i18n';
const { t, locale } = useTranslation();
// In template: {t('post.title')}

// Astro (server-side):
import i18n from '@cf-blog/i18n';
const t = i18n.t.bind(i18n);
// In template: {t('post.title')}
```

### API Client Pattern (Next.js example)

```typescript
// All frameworks call /api/* routes which proxy to Workers
const res = await fetch('/api/stats');
const data = await res.json();
```

### Session Management

```typescript
// Frontend: Get current session
const session = await fetch('/api/auth/session');

// Backend: Verify JWT middleware
const session = c.get('session'); // Added by authMiddleware
```

### Database Queries (Drizzle)

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { posts, users } from '@cf-blog/db/schema';

const db = drizzle(c.env.DB);
const result = await db.select().from(posts).where(eq(posts.status, 'published')).all();
```

### Authentication in Routes

```typescript
app.post('/', authMiddleware, publisherMiddleware, async (c: AuthContext) => {
  const session = c.session; // Typed session available
  // session.userId, session.role, ...
});
```

## Wrangler Configuration

Key bindings in `wrangler.toml`:
- `DB` → D1 database (`cf-blog-db`)
- `CONFIG_KV`, `CACHE_KV`, `USER_KV` → KV namespaces
- `IMAGES_R2` → R2 bucket for image storage
- `PresenceDO`, `RoomDO`, `HomeDO` → Durable Objects

## Development Notes

- **Local D1**: Use `--local` flag for local database: `wrangler d1 migrations apply cf-blog-db --local`
- **Hot Reload**: All framework dev servers support HMR
- **TypeScript**: Strict mode enabled; `any` type should be avoided
- **Testing**: Unit tests use Vitest, E2E tests use Playwright
- **Seed Data**: Run `pnpm db:seed` to populate sample posts/users
- **i18n**: All user-facing text must use i18n keys, never hardcoded strings. Blog brand names (e.g., "Next.js Blog") are exceptions.
- **pnpm catalog**: When adding deps shared across apps, add to `pnpm-workspace.yaml` catalog and reference with `catalog:` in package.json

## Common Tasks

### Add a new API endpoint

1. Add route handler in `apps/api/src/routes/*.ts`
2. Export type from `packages/db/src/schema.ts` if new table
3. Create migration: `pnpm -F @cf-blog/db db:generate`
4. Apply migration: `pnpm db:migrate:local`

### Add a new frontend page

1. Create page file in framework-specific location:
   - Next.js: `apps/next-blog/src/app/*/page.tsx`
   - Nuxt: `apps/nuxt-blog/pages/*.vue`
   - SvelteKit: `apps/svelte-blog/src/routes/*/+page.svelte`
   - Solid: `apps/solid-blog/src/routes/*.tsx`
   - Astro: `apps/astro-blog/src/pages/*.astro`
2. Call `/api/*` endpoints for data fetching
3. Use framework's routing conventions for dynamic routes
4. Use i18n for all user-facing text: add keys to `packages/i18n/src/translations.ts`

### Add a new i18n key

1. Add key to `TranslationKey` type union in `packages/i18n/src/translations.ts`
2. Add Chinese translation to `zhCN` object
3. Add English translation to `en` object
4. Use `t('key')` in the relevant component

### Database Migration

```bash
# 1. Modify schema in packages/db/src/schema.ts
# 2. Generate migration
pnpm -F @cf-blog/db db:generate
# 3. Apply locally
pnpm db:migrate:local
# 4. Seed if needed
pnpm db:seed
```
