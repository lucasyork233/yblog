const fs = require('fs');
const matter = require('gray-matter');

const mdFiles = fs.readdirSync('./posts-md').filter(f => f.endsWith('.md') && f !== 'README.md');
console.log(`\n找到 ${mdFiles.length} 篇文章，开始构建...\n`);

const blogs = [];

mdFiles.forEach(file => {
  const { data, content } = matter(fs.readFileSync(`./posts-md/${file}`, 'utf-8'));
  if (!data.slug || !data.title || !data.date) return;
  
  const jsContent = `window.${data.slug.replace(/-/g, '')} = ${JSON.stringify({
    slug: data.slug,
    title: data.title,
    date: data.date,
    summary: data.summary || '',
    tags: data.tags || [],
    content: content.trim()
  })};
`;
  
  fs.writeFileSync(`./posts/${data.slug}.js`, jsContent, 'utf-8');
  console.log(`✓ ${file} → ${data.slug}.js`);
  
  blogs.push({ slug: data.slug, title: data.title, date: data.date, summary: data.summary || '', tags: data.tags || [] });
});

blogs.sort((a, b) => b.slug.localeCompare(a.slug));

const parseMarkdownCode = fs.readFileSync('./parseMarkdown.template.js', 'utf-8');

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

${parseMarkdownCode}
`;

fs.writeFileSync('./data.js', dataJs);
console.log(`\n✓ 生成 data.js (${blogs.length} 篇文章)\n构建完成！🎉\n`);
