# GitHub Secrets 配置指南

本文档说明如何在 GitHub 仓库中配置所需的 Secrets。

## 必需的 Secrets

### 1. Cloudflare 凭证

| Secret 名称 | 说明 | 获取方式 |
|------------|------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | 见下方步骤 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | 见下方步骤 |

### 2. 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击右上角头像 → **My Profile**
3. 选择 **API Tokens** 标签
4. 点击 **Create Token**
5. 选择 **Edit Cloudflare Workers** 模板
6. 配置权限：
   - **Account.Account Settings.Read**
   - **Account.Cloudflare Pages.Read**
   - **Account.Cloudflare Pages.Edit**
   - **Workers Scripts.Write**
   - **Workers KV Storage.Write**
   - **D1.Read**
   - **D1.Write**
7. 点击 **Create Token**
8. 复制生成的 Token，添加到 GitHub Secrets

### 3. 获取 Cloudflare Account ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在首页右侧找到 **Account ID**
3. 点击复制按钮
4. 添加到 GitHub Secrets

## 配置步骤

### 在 GitHub 仓库中添加 Secrets

1. 进入你的 GitHub 仓库
2. 点击 **Settings** 标签
3. 在左侧菜单选择 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**
5. 添加以下 Secrets：

```
Name: CLOUDFLARE_API_TOKEN
Value: <你的 API Token>

Name: CLOUDFLARE_ACCOUNT_ID
Value: <你的 Account ID>
```

## 验证配置

配置完成后，CI/CD 流程会自动运行：

1. 推送代码到 `main` 分支
2. 在 **Actions** 标签查看构建状态
3. 部署成功后，访问 Cloudflare Pages 查看应用

## 本地开发配置

本地开发时，复制 `.env.example` 为 `.dev.vars`：

```bash
cp .env.example .dev.vars
```

然后填入你的实际配置值。

## 故障排查

### 部署失败：权限不足

确保 API Token 有足够的权限：
- Cloudflare Pages.Read/Edit
- Workers Scripts.Write
- D1.Read/Write
- KV Storage.Write

### 部署失败：Account ID 错误

检查 Account ID 是否正确复制，没有多余空格。

### 构建失败：环境变量缺失

确保所有必需的环境变量已在 Cloudflare Pages 项目中配置：
1. 进入 Cloudflare Pages 项目
2. 选择 **Settings** → **Environment variables**
3. 添加 `.env.example` 中列出的所有变量
