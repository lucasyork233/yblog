// 博客数据 - 使用全局变量获取文章内容
const blogs = [
  {
    slug: 'hello-world',
    title: 'Hello World',
    date: '2026-01-01',
    summary: '这是我的第一篇博客文章，欢迎大家来到我的博客。',
    tags: ['hello', 'introduction'],
    content: window.helloWorldContent
  },
  {
    slug: 'my-second-post',
    title: '我的第二篇文章',
    date: '2026-01-05',
    summary: '探索极简主义设计的魅力。',
    tags: ['design', 'minimalism'],
    content: window.mySecondPostContent
  }
];

// 简单的 Markdown 解析器
function parseMarkdown(markdown) {
  let html = markdown;

  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 引用
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 无序列表
  html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // 段落
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // 换行
  html = html.replace(/\n/g, '<br>');

  // 清理空段落
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

  return html;
}

// 格式化日期
function formatDate(dateStr, format = 'MM-DD') {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (format === 'full') {
    return `${year}年 ${month}月 ${day}日`;
  }
  return `${month}-${day}`;
}
