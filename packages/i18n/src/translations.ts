/**
 * 国际化翻译文件
 *
 * 支持的語言：
 * - zh-CN: 简体中文
 * - en: English
 */

export type Locale = 'zh-CN' | 'en';

export type TranslationKey =
  // 导航
  | 'nav.home'
  | 'nav.admin'
  | 'nav.login'
  | 'nav.logout'
  | 'nav.register'
  // 通用
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.delete'
  | 'common.edit'
  | 'common.save'
  | 'common.create'
  | 'common.update'
  | 'common.view'
  | 'common.actions'
  // 文章
  | 'post.title'
  | 'post.slug'
  | 'post.excerpt'
  | 'post.content'
  | 'post.contentPlaceholder'
  | 'post.editorTip'
  | 'post.status'
  | 'post.status.draft'
  | 'post.status.published'
  | 'post.framework'
  | 'post.viewCount'
  | 'post.createdAt'
  | 'post.updatedAt'
  | 'post.publishedAt'
  | 'post.new'
  | 'post.edit'
  | 'post.delete'
  | 'post.deleteConfirm'
  | 'post.list'
  | 'post.management'
  | 'post.noPosts'
  | 'post.loadFailed'
  | 'post.createFailed'
  | 'post.updateFailed'
  | 'post.sample1.title'
  | 'post.sample2.title'
  // 评论
  | 'comment.title'
  | 'comment.content'
  | 'comment.status'
  | 'comment.status.pending'
  | 'comment.status.approved'
  | 'comment.status.rejected'
  | 'comment.approve'
  | 'comment.reject'
  | 'comment.rejectReason'
  | 'comment.management'
  | 'comment.pending'
  // 用户
  | 'user.title'
  | 'user.email'
  | 'user.name'
  | 'user.role'
  | 'user.role.admin'
  | 'user.role.publisher'
  | 'user.role.commenter'
  | 'user.management'
  | 'user.pending'
  // 认证
  | 'auth.login'
  | 'auth.register'
  | 'auth.email'
  | 'auth.password'
  | 'auth.passwordConfirm'
  | 'auth.forgotPassword'
  | 'auth.github'
  | 'auth.passkey'
  | 'auth.or'
  | 'auth.useEmail'
  | 'auth.loginTitle'
  | 'auth.loginSubtitle'
  | 'auth.registerTitle'
  | 'auth.registerSubtitle'
  | 'auth.nickname'
  | 'auth.passwordMismatch'
  | 'auth.passwordMinLength'
  | 'auth.loginFailed'
  | 'auth.registerFailed'
  | 'auth.networkError'
  | 'auth.loggingIn'
  | 'auth.registering'
  | 'auth.noAccount'
  | 'auth.hasAccount'
  | 'auth.useEmailLogin'
  | 'auth.useEmailRegister'
  | 'auth.pendingTitle'
  | 'auth.pendingMessage'
  | 'auth.pendingEmail'
  | 'auth.approvalProcess'
  | 'auth.approvalStep1'
  | 'auth.approvalStep2'
  | 'auth.approvalStep3'
  | 'auth.backToLogin'
  | 'auth.githubRedirecting'
  | 'auth.passkeyUnsupported'
  | 'auth.passkeyProcessing'
  | 'auth.passkeyRegister'
  | 'auth.passkeyFailed'
  // 管理后台
  | 'admin.title'
  | 'admin.dashboard'
  | 'admin.settings'
  | 'admin.posts'
  | 'admin.comments'
  | 'admin.users'
  | 'admin.back'
  | 'admin.backToBlog'
  | 'admin.quickActions'
  | 'admin.quickActions.newPost'
  | 'admin.quickActions.approveComments'
  | 'admin.quickActions.userManagement'
  | 'admin.quickActions.settings'
  | 'admin.approveComments'
  | 'admin.userManagement'
  | 'admin.recentActivity'
  | 'admin.activity.newPost'
  | 'admin.activity.time'
  | 'admin.activity.time.hour'
  | 'admin.viewDetails'
  // 统计
  | 'stats.totalPosts'
  | 'stats.totalComments'
  | 'stats.totalUsers'
  | 'stats.totalViews'
  | 'stats.totalViews.sub'
  // 框架名称
  | 'framework.next'
  | 'framework.nuxt'
  | 'framework.svelte'
  | 'framework.astro'
  | 'framework.solid'
  // 过滤器
  | 'filter.all'
  | 'filter.published'
  | 'filter.draft'
  | 'filter.pending'
  | 'filter.approved'
  | 'filter.rejected'
  // 表单
  | 'form.required'
  | 'form.invalid'
  | 'form.success'
  | 'form.error'
  // 公共页面
  | 'site.poweredBy'
  | 'site.frameworkSwitch'
  | 'site.latestPosts'
  | 'site.noPosts'
  | 'site.backToHome'
  | 'site.publishedAt'
  | 'site.updatedAt'
  | 'site.postNotExist'
  | 'site.copyright'
  // 设置
  | 'settings.basicInfo'
  | 'settings.siteTitle'
  | 'settings.siteDesc'
  | 'settings.logoUrl'
  | 'settings.footerText'
  | 'settings.featureToggles'
  | 'settings.enableComments'
  | 'settings.enableAnalytics'
  | 'settings.saved'
  | 'settings.saving'
  | 'settings.saveConfig'
  // 文章表单
  | 'post.titlePlaceholder'
  | 'post.slugPlaceholder'
  | 'post.excerptPlaceholder'
  | 'post.publish'
  | 'post.backToList'
  | 'post.backToAdmin'
  | 'post.createPost'
  | 'post.editPost'
  | 'post.saving'
  | 'post.publishPost'
  | 'post.saveDraft'
  | 'post.saveChanges'
  // 用户
  | 'user.approved'
  | 'user.approve'
  | 'user.publisherApplication'
  | 'user.registrationDate'
  | 'user.noUsers'
  // 评论
  | 'comment.noComments'
  | 'comment.commentedOn'
  | 'comment.approveFailed'
  | 'comment.rejectFailed'
  // 用户操作
  | 'user.approveFailed'
  | 'user.roleChangeFailed'
  | 'user.publisherApplication.actionFailed'
  | 'user.publisherApplication.approved'
  | 'user.publisherApplication.rejected'
  // 设置
  | 'settings.error';

export type TranslationValue = string | { [key: string]: TranslationValue };

export interface Translations {
  [key: string]: TranslationValue;
}

/**
 * 中文翻译
 */
export const zhCN: Translations = {
  // 导航
  'nav.home': '首页',
  'nav.admin': '管理后台',
  'nav.login': '登录',
  'nav.logout': '退出',
  'nav.register': '注册',
  // 通用
  'common.loading': '加载中...',
  'common.error': '发生错误',
  'common.success': '操作成功',
  'common.cancel': '取消',
  'common.confirm': '确认',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.save': '保存',
  'common.create': '创建',
  'common.update': '更新',
  'common.view': '查看',
  'common.actions': '操作',
  // 文章
  'post.title': '标题',
  'post.slug': '别名',
  'post.excerpt': '摘要',
  'post.content': '内容',
  'post.status': '状态',
  'post.status.draft': '草稿',
  'post.status.published': '已发布',
  'post.framework': '框架',
  'post.viewCount': '浏览量',
  'post.createdAt': '创建时间',
  'post.updatedAt': '更新时间',
  'post.publishedAt': '发布时间',
  'post.new': '新建文章',
  'post.edit': '编辑文章',
  'post.delete': '删除文章',
  'post.deleteConfirm': '确定要删除这篇文章吗？',
  'post.list': '文章列表',
  'post.management': '文章管理',
  'post.noPosts': '暂无文章',
  'post.loadFailed': '加载文章失败',
  'post.createFailed': '创建失败',
  'post.updateFailed': '更新失败',
  'post.contentPlaceholder': '输入文章内容...',
  'post.editorTip': '提示：目前使用纯文本编辑器，富文本编辑器待集成',
  'post.sample1.title': '欢迎来到 Cloudflare 博客',
  'post.sample2.title': 'Next.js 14 静态导出指南',
  // 评论
  'comment.title': '评论',
  'comment.content': '评论内容',
  'comment.status': '状态',
  'comment.status.pending': '待审批',
  'comment.status.approved': '已通过',
  'comment.status.rejected': '已拒绝',
  'comment.approve': '通过',
  'comment.reject': '拒绝',
  'comment.rejectReason': '拒绝理由',
  'comment.management': '评论审批',
  'comment.pending': '待审批',
  // 用户
  'user.title': '用户',
  'user.email': '邮箱',
  'user.name': '姓名',
  'user.role': '角色',
  'user.role.admin': '管理员',
  'user.role.publisher': '发布者',
  'user.role.commenter': '评论者',
  'user.management': '用户管理',
  'user.pending': '待审批',
  // 认证
  'auth.login': '登录',
  'auth.register': '注册',
  'auth.email': '邮箱',
  'auth.password': '密码',
  'auth.passwordConfirm': '确认密码',
  'auth.forgotPassword': '忘记密码',
  'auth.github': '使用 GitHub 登录',
  'auth.passkey': '使用 Passkey 登录',
  'auth.or': '或',
  'auth.useEmail': '使用邮箱登录',
  'auth.loginTitle': '登录博客',
  'auth.loginSubtitle': '欢迎回来',
  'auth.registerTitle': '注册博客账号',
  'auth.registerSubtitle': '加入我们的社区',
  'auth.nickname': '昵称',
  'auth.passwordMismatch': '两次输入的密码不一致',
  'auth.passwordMinLength': '密码长度至少为 6 位',
  'auth.loginFailed': '登录失败',
  'auth.registerFailed': '注册失败',
  'auth.networkError': '网络错误，请稍后重试',
  'auth.loggingIn': '登录中...',
  'auth.registering': '注册中...',
  'auth.noAccount': '还没有账号？',
  'auth.hasAccount': '已有账号？',
  'auth.useEmailLogin': '或使用邮箱登录',
  'auth.useEmailRegister': '或使用邮箱注册',
  'auth.pendingTitle': '账号待审批',
  'auth.pendingMessage': '您的账号已注册成功，正在等待管理员审批。',
  'auth.pendingEmail': '注册邮箱',
  'auth.approvalProcess': '审批流程说明：',
  'auth.approvalStep1': '管理员会在 1-3 个工作日内审核您的申请',
  'auth.approvalStep2': '审核通过后，您将收到邮件通知',
  'auth.approvalStep3': '登录即可查看审批状态',
  'auth.backToLogin': '返回登录',
  'auth.githubRedirecting': '跳转中...',
  'auth.passkeyUnsupported': '浏览器不支持 Passkey',
  'auth.passkeyProcessing': '处理中...',
  'auth.passkeyRegister': '注册 Passkey',
  'auth.passkeyFailed': 'Passkey 操作失败',
  // 管理后台
  'admin.title': '管理后台',
  'admin.dashboard': '仪表盘',
  'admin.settings': '站点配置',
  'admin.posts': '文章管理',
  'admin.comments': '评论审批',
  'admin.users': '用户管理',
  'admin.back': '返回管理后台',
  'admin.backToBlog': '返回博客',
  'admin.quickActions': '快速操作',
  'admin.quickActions.newPost': '创建一篇新的博客文章',
  'admin.quickActions.approveComments': '处理待审批的评论',
  'admin.quickActions.userManagement': '审批用户和角色管理',
  'admin.quickActions.settings': '配置站点参数和功能',
  'admin.approveComments': '审批评论',
  'admin.userManagement': '用户管理',
  'admin.recentActivity': '最近活动',
  'admin.activity.newPost': '用户发布了新文章',
  'admin.activity.time': '{hours} 小时前',
  'admin.activity.time.hour': '小时',
  'admin.viewDetails': '查看详情',
  // 统计
  'stats.totalPosts': '总文章数',
  'stats.totalComments': '总评论数',
  'stats.totalUsers': '总用户数',
  'stats.totalViews': '总访问量',
  'stats.totalViews.sub': '全平台累计',
  // 框架名称
  'framework.next': 'Next.js',
  'framework.nuxt': 'Nuxt',
  'framework.svelte': 'SvelteKit',
  'framework.astro': 'Astro',
  'framework.solid': 'SolidStart',
  // 过滤器
  'filter.all': '全部',
  'filter.published': '已发布',
  'filter.draft': '草稿',
  'filter.pending': '待审批',
  'filter.approved': '已通过',
  'filter.rejected': '已拒绝',
  // 表单
  'form.required': '此项为必填项',
  'form.invalid': '输入无效',
  'form.success': '操作成功',
  'form.error': '操作失败',
  // 公共页面
  'site.poweredBy': '由 Cloudflare Workers + D1 驱动',
  'site.frameworkSwitch': '框架切换:',
  'site.latestPosts': '最新文章',
  'site.noPosts': '暂无文章',
  'site.backToHome': '← 返回首页',
  'site.publishedAt': '发表于',
  'site.updatedAt': '更新于',
  'site.postNotExist': '文章不存在',
  'site.copyright': '© {year} Cloudflare Blog. All rights reserved.',
  // 设置
  'settings.basicInfo': '基本信息',
  'settings.siteTitle': '站点标题',
  'settings.siteDesc': '站点描述',
  'settings.logoUrl': 'Logo URL',
  'settings.footerText': '页脚文本',
  'settings.featureToggles': '功能开关',
  'settings.enableComments': '启用评论',
  'settings.enableAnalytics': '启用访问统计',
  'settings.saved': '配置已保存！',
  'settings.saving': '保存中...',
  'settings.saveConfig': '保存配置',
  // 文章表单
  'post.titlePlaceholder': '输入文章标题',
  'post.slugPlaceholder': 'article-slug',
  'post.excerptPlaceholder': '文章摘要...',
  'post.publish': '发布',
  'post.backToList': '← 返回文章列表',
  'post.backToAdmin': '← 返回管理后台',
  'post.createPost': '新建文章',
  'post.editPost': '编辑文章',
  'post.saving': '保存中...',
  'post.publishPost': '发布文章',
  'post.saveDraft': '保存草稿',
  'post.saveChanges': '保存更改',
  // 用户
  'user.approved': '已批准',
  'user.approve': '批准',
  'user.publisherApplication': '发布者申请',
  'user.registrationDate': '注册时间',
  'user.noUsers': '暂无用户',
  // 评论
  'comment.noComments': '暂无评论',
  'comment.commentedOn': '评论于',
  'comment.approveFailed': '审批失败',
  'comment.rejectFailed': '拒绝失败',
  // 用户操作
  'user.approveFailed': '批准用户失败',
  'user.roleChangeFailed': '修改角色失败',
  'user.publisherApplication.actionFailed': '处理发布者申请失败',
  'user.publisherApplication.approved': '已通过',
  'user.publisherApplication.rejected': '已拒绝',
  // 设置
  'settings.error': '保存失败',
};

/**
 * English Translations
 */
export const en: Translations = {
  // Navigation
  'nav.home': 'Home',
  'nav.admin': 'Admin',
  'nav.login': 'Login',
  'nav.logout': 'Logout',
  'nav.register': 'Register',
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error occurred',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.save': 'Save',
  'common.create': 'Create',
  'common.update': 'Update',
  'common.view': 'View',
  'common.actions': 'Actions',
  // Posts
  'post.title': 'Title',
  'post.slug': 'Slug',
  'post.excerpt': 'Excerpt',
  'post.content': 'Content',
  'post.status': 'Status',
  'post.status.draft': 'Draft',
  'post.status.published': 'Published',
  'post.framework': 'Framework',
  'post.viewCount': 'Views',
  'post.createdAt': 'Created At',
  'post.updatedAt': 'Updated At',
  'post.publishedAt': 'Published At',
  'post.new': 'New Post',
  'post.edit': 'Edit Post',
  'post.delete': 'Delete Post',
  'post.deleteConfirm': 'Are you sure you want to delete this post?',
  'post.list': 'Post List',
  'post.management': 'Post Management',
  'post.noPosts': 'No posts yet',
  'post.loadFailed': 'Failed to load post',
  'post.createFailed': 'Failed to create',
  'post.updateFailed': 'Failed to update',
  'post.contentPlaceholder': 'Enter post content...',
  'post.editorTip': 'Tip: Currently using plain text editor. Rich text editor coming soon.',
  'post.sample1.title': 'Welcome to Cloudflare Blog',
  'post.sample2.title': 'Next.js 14 SSG Guide',
  // Comments
  'comment.title': 'Comments',
  'comment.content': 'Comment Content',
  'comment.status': 'Status',
  'comment.status.pending': 'Pending',
  'comment.status.approved': 'Approved',
  'comment.status.rejected': 'Rejected',
  'comment.approve': 'Approve',
  'comment.reject': 'Reject',
  'comment.rejectReason': 'Rejection Reason',
  'comment.management': 'Comment Management',
  'comment.pending': 'Pending',
  // Users
  'user.title': 'Users',
  'user.email': 'Email',
  'user.name': 'Name',
  'user.role': 'Role',
  'user.role.admin': 'Admin',
  'user.role.publisher': 'Publisher',
  'user.role.commenter': 'Commenter',
  'user.management': 'User Management',
  'user.pending': 'Pending',
  // Auth
  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.passwordConfirm': 'Confirm Password',
  'auth.forgotPassword': 'Forgot Password',
  'auth.github': 'Login with GitHub',
  'auth.passkey': 'Login with Passkey',
  'auth.or': 'or',
  'auth.useEmail': 'Login with Email',
  'auth.loginTitle': 'Login to Blog',
  'auth.loginSubtitle': 'Welcome back',
  'auth.registerTitle': 'Register Blog Account',
  'auth.registerSubtitle': 'Join our community',
  'auth.nickname': 'Nickname',
  'auth.passwordMismatch': 'Passwords do not match',
  'auth.passwordMinLength': 'Password must be at least 6 characters',
  'auth.loginFailed': 'Login failed',
  'auth.registerFailed': 'Registration failed',
  'auth.networkError': 'Network error, please try again later',
  'auth.loggingIn': 'Logging in...',
  'auth.registering': 'Registering...',
  'auth.noAccount': "Don't have an account?",
  'auth.hasAccount': 'Already have an account?',
  'auth.useEmailLogin': 'or login with email',
  'auth.useEmailRegister': 'or register with email',
  'auth.pendingTitle': 'Account Pending Approval',
  'auth.pendingMessage': 'Your account has been registered and is awaiting admin approval.',
  'auth.pendingEmail': 'Registration email',
  'auth.approvalProcess': 'Approval process:',
  'auth.approvalStep1': 'Admins will review your application within 1-3 business days',
  'auth.approvalStep2': 'You will receive an email notification once approved',
  'auth.approvalStep3': 'You can check approval status after logging in',
  'auth.backToLogin': 'Back to Login',
  'auth.githubRedirecting': 'Redirecting...',
  'auth.passkeyUnsupported': 'Passkey not supported by browser',
  'auth.passkeyProcessing': 'Processing...',
  'auth.passkeyRegister': 'Register Passkey',
  'auth.passkeyFailed': 'Passkey operation failed',
  // Admin
  'admin.title': 'Admin Dashboard',
  'admin.dashboard': 'Dashboard',
  'admin.settings': 'Settings',
  'admin.posts': 'Posts',
  'admin.comments': 'Comments',
  'admin.users': 'Users',
  'admin.back': 'Back to Admin',
  'admin.backToBlog': 'Back to Blog',
  'admin.quickActions': 'Quick Actions',
  'admin.quickActions.newPost': 'Create a new blog post',
  'admin.quickActions.approveComments': 'Handle pending comments',
  'admin.quickActions.userManagement': 'Approve users and role management',
  'admin.quickActions.settings': 'Configure site parameters',
  'admin.approveComments': 'Approve Comments',
  'admin.userManagement': 'User Management',
  'admin.recentActivity': 'Recent Activity',
  'admin.activity.newPost': 'User published a new post',
  'admin.activity.time': '{hours} hours ago',
  'admin.activity.time.hour': 'hour',
  'admin.viewDetails': 'View Details',
  // Stats
  'stats.totalPosts': 'Total Posts',
  'stats.totalComments': 'Total Comments',
  'stats.totalUsers': 'Total Users',
  'stats.totalViews': 'Total Views',
  'stats.totalViews.sub': 'Platform-wide',
  // Frameworks
  'framework.next': 'Next.js',
  'framework.nuxt': 'Nuxt',
  'framework.svelte': 'SvelteKit',
  'framework.astro': 'Astro',
  'framework.solid': 'SolidStart',
  // Filters
  'filter.all': 'All',
  'filter.published': 'Published',
  'filter.draft': 'Draft',
  'filter.pending': 'Pending',
  'filter.approved': 'Approved',
  'filter.rejected': 'Rejected',
  // Forms
  'form.required': 'This field is required',
  'form.invalid': 'Invalid input',
  'form.success': 'Success',
  'form.error': 'Failed',
  // Public pages
  'site.poweredBy': 'Powered by Cloudflare Workers + D1',
  'site.frameworkSwitch': 'Framework:',
  'site.latestPosts': 'Latest Posts',
  'site.noPosts': 'No posts yet',
  'site.backToHome': '← Back to Home',
  'site.publishedAt': 'Published at',
  'site.updatedAt': 'Updated at',
  'site.postNotExist': 'Post does not exist',
  'site.copyright': '© {year} Cloudflare Blog. All rights reserved.',
  // Settings
  'settings.basicInfo': 'Basic Info',
  'settings.siteTitle': 'Site Title',
  'settings.siteDesc': 'Site Description',
  'settings.logoUrl': 'Logo URL',
  'settings.footerText': 'Footer Text',
  'settings.featureToggles': 'Feature Toggles',
  'settings.enableComments': 'Enable Comments',
  'settings.enableAnalytics': 'Enable Analytics',
  'settings.saved': 'Settings saved!',
  'settings.saving': 'Saving...',
  'settings.saveConfig': 'Save Settings',
  // Post form
  'post.titlePlaceholder': 'Enter post title',
  'post.slugPlaceholder': 'article-slug',
  'post.excerptPlaceholder': 'Post excerpt...',
  'post.publish': 'Publish',
  'post.backToList': '← Back to Posts',
  'post.backToAdmin': '← Back to Admin',
  'post.createPost': 'New Post',
  'post.editPost': 'Edit Post',
  'post.saving': 'Saving...',
  'post.publishPost': 'Publish Post',
  'post.saveDraft': 'Save Draft',
  'post.saveChanges': 'Save Changes',
  // Users
  'user.approved': 'Approved',
  'user.approve': 'Approve',
  'user.publisherApplication': 'Publisher Application',
  'user.registrationDate': 'Registration Date',
  'user.noUsers': 'No users',
  // Comments
  'comment.noComments': 'No comments',
  'comment.commentedOn': 'Commented on',
  'comment.approveFailed': 'Approval failed',
  'comment.rejectFailed': 'Rejection failed',
};

/**
 * 所有翻译
 */
export const translations: Record<Locale, Translations> = {
  'zh-CN': zhCN,
  en,
};

/**
 * 支持的语言列表
 */
export const supportedLocales: { code: Locale; name: string; flag: string }[] = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

/**
 * 默认语言
 */
export const defaultLocale: Locale = 'zh-CN';
