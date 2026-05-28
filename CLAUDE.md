# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 常用命令

- `pnpm dev` — 启动开发服务器，访问 http://localhost:3000（Mock 服务器同时在 8086 端口启动）
- `pnpm build:dev` — 类型检查 + 开发环境构建
- `pnpm build:pro` — 类型检查 + 生产环境构建（输出到 `dist/`）
- `pnpm preview` — 预览生产构建产物
- `pnpm lint` — 运行 ESLint 检查
- `pnpm lint:fix` — 运行 ESLint 并自动修复
- `pnpm typecheck` — 仅运行 vue-tsc 类型检查（不构建）

## 架构概览

### 技术栈
- **Vue 3**（Composition API + `<script setup>`）+ **TypeScript 6**
- **Vite 8** 构建工具，**pnpm** 包管理器
- **Vant 4** 移动端 UI 库（组件自动导入，无需手动 import）
- **Pinia 3** 状态管理（配合 `pinia-plugin-persistedstate` 实现 localStorage 持久化）
- **Vue Router 5** + **文件系统自动路由**（路由从 `src/pages/` 目录自动生成）
- **UnoCSS**（Wind4 预设）原子化 CSS，**Less** 用于 scoped 样式
- **vue-i18n** 国际化（zh-CN + en-US）
- **Axios** HTTP 请求（拦截器自动注入 token，自动解包响应）

### 路由与页面系统

路由从 `src/pages/` 通过 `vue-router/auto-routes` 自动生成。每个页面可在 SFC 中用 `<route lang="json5">` 块声明元数据。路由缓存通过在 meta 中设置 `keepAlive: true` 控制——`routeCache` Pinia store 动态跟踪需要缓存的页面，并传给 [App.vue](src/App.vue) 中的 `<keep-alive :include>`。

[config/routes.ts](src/config/routes.ts) 定义了 `rootRouteList`——这些路由上 NavBar 返回箭头隐藏，TabBar 显示。

关键路由文件：
- [router/index.ts](src/router/index.ts) — 路由配置，全局 beforeEach/afterEach 守卫（NProgress 进度条、自动获取用户信息、i18n 页面标题、路由缓存追踪）
- [router/types.ts](src/router/types.ts) — 路由 meta 类型扩展（添加 `keepAlive` 字段）

### 状态管理（Pinia）

[src/stores/modules/](src/stores/modules/) 下三个 store：
- **user** — 认证状态（uid, name, avatar, token），持久化到 localStorage。操作：login, logout, info, getCode, resetPassword, register
- **counter** — 演示 store（计数器），持久化
- **routeCache** — 跟踪供 `<keep-alive>` 使用的路由名。方法 `addRoute(route)` 检查 `meta.keepAlive`

### 国际化

语言包在 [src/locales/](src/locales/)（zh-CN.json, en-US.json）。Vant 组件语言通过 [utils/i18n.ts](src/utils/i18n.ts) 与应用语言自动同步。`i18n` 和 `locale` 对象已全局自动导入（无需 import）。

### 样式方案

三层 CSS 并存：
1. **UnoCSS** 工具类快速样式（Wind4 预设，配置在 [uno.config.ts](uno.config.ts)）
2. 组件内 **Scoped Less**：`<style scoped lang="less">`
3. **全局 Less** 覆盖：[src/styles/](src/styles/)（Vant CSS 变量覆盖使用 `:root:root` 提高优先级）

移动端适配：`postcss-mobile-forever`，375px 设计稿，构建时 px→vw 转换，最大显示宽度 600px。

### API 层

- [utils/request.ts](src/utils/request.ts) — Axios 实例，自动注入 `Access-Token` 请求头（从 localStorage 读取），6 秒超时，401/403 错误处理（Vant Notify 提示）
- [api/](src/api/) — 按业务域分组的 API 函数（user.ts, approval.ts）
- [mock/](src/mock/) — 由 `vite-plugin-mock-dev-server` 驱动的 Mock 服务（仅开发环境，生产环境自动禁用）

### 认证流程

Token 通过 `@vueuse/core` 的 `useLocalStorage` 存储在 localStorage。路由的 beforeEach 守卫检查 `isLogin()`，如果 token 存在但 store 中没有用户信息则自动拉取。退出登录清除 token 并重定向。

### 暗黑模式

由 [composables/dark.ts](src/composables/dark.ts) 管理（全局自动导入）。使用 `@vueuse/core` 的 `useDark`/`useToggle`。同步 Vant ConfigProvider 主题、ECharts 主题、favicon 和 meta theme-color。持久化到 localStorage。`index.html` 中有防闪白的内联脚本。
