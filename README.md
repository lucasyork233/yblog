# Lucky's Blog

## Quick Start

### 1. add article

```
# posts-md/post-001.md

---
slug: post-001
title: 文章标题
date: 2026-01-01
summary: 文章摘要
tags: [tag1, tag2]
---
```

### 2. build

```
# 1. 读取 /posts-md/*.md
# 2. 生成 /posts/*.js
# 3. 更新 data.js
$ npm run build
```

### 3. local view

1. `python -m http.server 8000`
2. `http://localhost:8000`

## Item Structure

```
yblog/
├── index.html         # 主入口
├── assets/images/         # 图片
├── tools/                 # 脚本工具
├── css/
│   ├── base.css           # 基础样式
│   ├── components.css     # 组件样式
│   ├── pages.css          # 页面样式
│   ├── prose.css          # 文章样式
│   └── responsive.css     # 响应式
├── js/
│   ├── utils.js           # 工具函数
│   └── router.js
├── posts/                 # .md -> .html
└── posts-md/              # markdown
    ├── post-001.md
    └── post-002.md
```
