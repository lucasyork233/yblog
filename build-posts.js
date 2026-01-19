const fs = require('fs');
const matter = require('gray-matter');

// 读取并执行 parseMarkdown 函数
const parseMarkdownCode = fs.readFileSync('./parseMarkdown.template.js', 'utf-8');
eval(parseMarkdownCode);

const mdFiles = fs.readdirSync('./posts-md').filter(f => f.endsWith('.md') && f !== 'README.md');
console.log(`\n找到 ${mdFiles.length} 篇文章，开始构建...\n`);

const blogs = [];

mdFiles.forEach(file => {
  const { data, content } = matter(fs.readFileSync(`./posts-md/${file}`, 'utf-8'));
  if (!data.slug || !data.title || !data.date) return;
  
  // 将 markdown 转换为 HTML
  const contentHtml = parseMarkdown(content.trim());
  
  // 生成 HTML 文件
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
</head>
<body>
  <article data-slug="${data.slug}" data-title="${data.title}" data-date="${data.date}" data-summary="${(data.summary || '').replace(/"/g, '&quot;')}" data-tags="${(data.tags || []).join(',')}">
    ${contentHtml}
  </article>
</body>
</html>`;
  
  fs.writeFileSync(`./posts/${data.slug}.html`, htmlContent, 'utf-8');
  console.log(`✓ ${file} → ${data.slug}.html`);
  
  blogs.push({ slug: data.slug, title: data.title, date: data.date, summary: data.summary || '', tags: data.tags || [] });
});

blogs.sort((a, b) => b.slug.localeCompare(a.slug));

const dataJs = `// 博客数据
const blogs = ${JSON.stringify(blogs, null, 2)};

// 日期格式化
function formatDate(dateStr, format = 'short') {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (format === 'full') return \`\${year}年\${parseInt(month)}月\${parseInt(day)}日\`;
  return \`\${year}-\${month}-\${day}\`;
}
`;

fs.writeFileSync('./data.js', dataJs);
console.log(`\n✓ 生成 data.js (${blogs.length} 篇文章)\n构建完成！🎉\n`);
