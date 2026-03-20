# AI 维护手册 — Lucifer 博客归档站

> 本文件供 AI agent 阅读，用于快速接管本网站的日常维护工作。

## 1. 项目概况

| 属性 | 值 |
|------|-----|
| 线上地址 | https://pc-study.github.io/csdn-blog/ |
| GitHub 仓库 | https://github.com/pc-study/csdn-blog |
| 源码分支 | `main`（Hexo 源码） |
| 部署分支 | `gh-pages`（静态 HTML） |
| 框架 | Hexo 8.x |
| 主题 | Butterfly 5.5.4（`themes/butterfly/`，静态文件，非 git submodule） |
| Node 版本 | >=18（见 `.nvmrc` 和 `package.json` engines） |
| 文章数量 | 528 篇 |
| 语言 | 中文（zh-CN） |

## 2. 目录结构

```
.
├── _config.yml              # Hexo 主配置
├── _config.butterfly.yml    # Butterfly 主题配置（优先于 themes/butterfly/_config.yml）
├── package.json             # 依赖声明
├── package-lock.json        # 依赖锁定（npm ci 使用）
├── .nvmrc                   # Node 版本：20
├── .gitignore
├── scaffolds/               # 新建文章模板
│   ├── post.md
│   └── draft.md
├── source/
│   ├── _posts/              # 528 篇文章（Markdown）
│   ├── about/index.md       # 关于页面
│   ├── tags/index.md        # 标签页面
│   ├── categories/index.md  # 分类页面
│   ├── archives/index.md    # 归档页面
│   ├── img/avatar.jpg       # 本地头像
│   ├── images/              # 文章图片（2,489 张，~455MB）
│   └── robots.txt           # SEO
├── themes/butterfly/        # 主题文件（静态，无 .git）
└── .github/workflows/       # CI/CD（需手动添加 deploy.yml）
```

## 3. 常用命令

```bash
# 安装依赖（首次或 CI 中使用）
npm ci

# 本地预览（http://localhost:4000/csdn-blog/）
npx hexo server

# 构建静态文件到 public/
npx hexo clean && npx hexo generate

# 新建文章
npx hexo new post "文章标题"
```

## 4. 文章格式规范

每篇文章的 front-matter 必须包含以下字段：

```yaml
---
title: '文章标题'                    # 单引号包裹，内部单引号用 '' 转义
date: 2024-01-01 12:00:00           # YYYY-MM-DD HH:mm:ss 格式
categories:
  - Oracle 数据库                    # 只选一个分类
tags:
  - oracle                          # 可多个标签
  - 数据库
abbrlink: 123456789                 # CSDN 文章 ID，作为永久链接
csdn_url: https://luciferliu.blog.csdn.net/article/details/123456789
description: '文章前150字的纯文本摘要'  # 用于 SEO meta description
keywords: 'oracle, 数据库'            # 用于 SEO meta keywords
---

正文内容（Markdown）...
```

### 分类体系（7 个，选其一）

| 分类 | 文章数 | 适用范围 |
|------|--------|---------|
| Oracle 数据库 | 277 | Oracle 相关的所有内容 |
| 数据库 | 134 | TiDB、达梦、金仓、MySQL、SQL 等非 Oracle 数据库 |
| Linux 运维 | 52 | Ubuntu、Shell、SSH、Vagrant、系统管理 |
| 技术文章 | 34 | 无法归入其他分类的技术内容 |
| 大数据 & AI | 16 | 大数据平台、机器学习、人工智能 |
| 多媒体处理 | 9 | FFmpeg、音视频相关 |
| 工具与效率 | 6 | 软件推荐、Windows/macOS 工具 |

### YAML 注意事项

- **标题必须用单引号**：`title: '标题'`，不能用双引号（`\d`、`\n` 等会被 YAML 解释为转义序列）
- **description 必须用单引号**：内容中的单引号用 `''` 转义
- **不要在单引号字符串中使用 `\n`**：YAML 会原样保留反斜杠，但某些解析器会出错
- **tags 是数组格式**：每个 tag 前加 `  - `

## 5. 部署流程

### 手动部署

```bash
npx hexo clean && npx hexo generate
cd public
git init -b gh-pages
git add -A
git commit -m "deploy: 更新说明"
git remote add origin https://github.com/pc-study/csdn-blog.git
git push origin gh-pages --force
```

### 自动部署（CI/CD）

仓库中有 `.github/workflows/deploy.yml`（可能需要手动添加，因为 OAuth token 缺少 `workflow` scope）。配置好后，push 到 `main` 分支会自动触发：

1. `npm ci` 安装依赖
2. `hexo clean && hexo generate` 构建
3. 将 `public/` 推送到 `gh-pages` 分支
4. GitHub Pages 自动从 `gh-pages` 部署

## 6. 配置文件说明

### `_config.yml` 关键配置

| 配置项 | 当前值 | 说明 |
|--------|--------|------|
| `url` | `https://pc-study.github.io/csdn-blog` | 站点完整 URL（含 base path） |
| `root` | `/csdn-blog/` | 子目录部署路径 |
| `permalink` | `posts/:abbrlink/` | 文章永久链接使用 CSDN ID |
| `per_page` | 12 | 每页文章数 |
| `theme` | butterfly | 主题名 |
| `feed.limit` | 100 | RSS 输出最新 100 篇 |

### `_config.butterfly.yml` 关键配置

| 配置项 | 说明 |
|--------|------|
| `darkmode.autoChangeMode: 1` | 暗黑模式跟随系统 |
| `search.use: local_search` | 本地全文搜索 |
| `lazyload.enable: true` | 图片懒加载 |
| `pjax.enable: true` | 无刷新页面切换 |
| `lightbox: fancybox` | 图片灯箱 |
| `theme_color.main: "#1a73e8"` | 主题色（蓝色） |
| `inject.head` | 异步加载 Google Fonts（Noto Sans SC + JetBrains Mono） |

## 7. 常见维护任务

### 添加新文章

```bash
npx hexo new post "文章标题"
# 编辑 source/_posts/文章标题.md
# 填写完整的 front-matter（见第4节）
# 构建并部署
```

### 批量修改文章 front-matter

用 Python 脚本处理 `source/_posts/*.md`。解析规则：
- 文件以 `---\n` 开头，第二个 `---\n` 结束 front-matter
- front-matter 是 YAML 格式
- 修改后用单引号包裹字符串字段

### 更新主题

当前主题是静态文件（非 npm 包，非 git submodule）。升级步骤：

1. 备份 `_config.butterfly.yml`
2. 删除 `themes/butterfly/`
3. 重新 clone：`git clone https://github.com/jerryc127/hexo-theme-butterfly.git themes/butterfly`
4. 删除 `themes/butterfly/.git`
5. 对照备份恢复 `_config.butterfly.yml` 中的自定义配置
6. 测试构建

### 添加图片

1. 将图片放入 `source/images/` 目录
2. 在文章中引用：`![alt 描述文字](/images/filename.png)`
3. **必须写 alt 文字**（无障碍访问 + SEO）
4. 建议图片宽度不超过 1200px，大小不超过 500KB

## 8. 已知限制和注意事项

1. **不要修改 `themes/butterfly/` 内的文件** — 所有主题自定义都通过 `_config.butterfly.yml` 完成，直接改主题文件会导致升级困难
2. **permalink 中的 abbrlink 是 CSDN 文章 ID** — 新文章如果不来自 CSDN，需要自定义一个唯一数字 ID
3. **images 目录约 455MB** — push 到 GitHub 时间较长，属于正常现象
4. **Google Fonts 在国内可能加载慢** — 已配置异步加载（`media="print" onload`），不会阻塞页面渲染，但字体可能延迟显示
5. **`source/robots.txt` 中的 Sitemap URL 必须与 `_config.yml` 的 `url` 保持一致** — 如果改域名，两处都要改
6. **不蒜子（busuanzi）访问统计依赖第三方服务** — 如果服务挂了，计数器会消失但不影响页面功能
7. **deploy.yml 需要手动添加到仓库** — OAuth App token 缺少 `workflow` scope，无法通过 API 推送
