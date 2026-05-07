// 工具函数和数据

// 博客数据
const blogs = [
  {
    "slug": "post-010",
    "title": "关于我看了坛经开头觉得很有意思这件事",
    "date": "2026-05-03T00:00:00.000Z",
    "summary": "《六祖坛经》，看了个开头",
    "tags": [
      "reading"
    ]
  },
  {
    "slug": "post-009",
    "title": "The ever-growing C drive",
    "date": "2026-04-11T00:00:00.000Z",
    "summary": "治标不治本的办法",
    "tags": [
      "Disk C"
    ]
  },
  {
    "slug": "post-008",
    "title": "《Free and Easy》一些思考",
    "date": "2026-01-07T00:00:00.000Z",
    "summary": "2017年上映的宝藏电影《轻松+愉快》",
    "tags": [
      "movie",
      "thoughts"
    ]
  },
  {
    "slug": "post-007",
    "title": "markdown - image",
    "date": "2026-01-06T00:00:00.000Z",
    "summary": "测试图片",
    "tags": [
      "markdown",
      "test"
    ]
  },
  {
    "slug": "post-006",
    "title": "markdown - quota",
    "date": "2026-01-06T00:00:00.000Z",
    "summary": "测试引用",
    "tags": [
      "markdown",
      "test"
    ]
  },
  {
    "slug": "post-005",
    "title": "markdown - codeblock",
    "date": "2026-01-06T00:00:00.000Z",
    "summary": "测试代码块",
    "tags": [
      "markdown",
      "test"
    ]
  },
  {
    "slug": "post-004",
    "title": "markdown - table",
    "date": "2026-01-06T00:00:00.000Z",
    "summary": "测试表格",
    "tags": [
      "markdown",
      "test"
    ]
  },
  {
    "slug": "post-003",
    "title": "markdown - list",
    "date": "2026-01-06T00:00:00.000Z",
    "summary": "测试列表",
    "tags": [
      "markdown",
      "test"
    ]
  },
  {
    "slug": "post-002",
    "title": "markdown - title",
    "date": "2026-01-05T00:00:00.000Z",
    "summary": "测试一级到六级的标题",
    "tags": [
      "markdown",
      "test"
    ]
  },
  {
    "slug": "post-001",
    "title": "first blog",
    "date": "2026-01-01T00:00:00.000Z",
    "summary": "第一篇博客",
    "tags": [
      "introduction"
    ]
  }
];

// 日期格式化函数
function formatDate(dateStr, format = 'short') {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (format === 'full') {
    return `${year}年${parseInt(month)}月${parseInt(day)}日`;
  }
  
  return `${year}-${month}-${day}`;
}
