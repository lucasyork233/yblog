// 博客数据
const blogs = [
  {
    "slug": "post-009",
    "title": "canvas fish",
    "date": "2026-01-16T00:00:00.000Z",
    "summary": "canvas foot fish demo",
    "tags": [
      "canvas",
      "animation"
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
    "summary": "这是我的第一篇博客文章，欢迎大家来到我的数字花园。",
    "tags": [
      "introduction"
    ]
  }
];

// 日期格式化
function formatDate(dateStr, format = 'short') {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (format === 'full') return `${year}年${parseInt(month)}月${parseInt(day)}日`;
  return `${year}-${month}-${day}`;
}
