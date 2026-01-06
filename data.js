// 博客数据管理器
const BlogManager = {
  // 文章列表（通过脚本动态加载）
  posts: [],
  
  // 初始化 - 加载所有文章
  async init() {
    // 动态加载文章文件
    await this.loadPosts();
  },
  
  // 加载文章脚本
  async loadPosts() {
    // 自动扫描 posts 目录下的所有文章文件
    const postFiles = await this.scanPostFiles();
    
    // 使用 Promise.all 并行加载所有文章
    const loadPromises = postFiles.map(file => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `posts/${file}`;
        script.onload = () => {
          // 从文件名提取变量名（如 post-01.js -> post01, test-markdown.js -> testMarkdown）
          const baseName = file.replace('.js', '');
          // 处理带连字符的情况，转换为驼峰命名（支持数字和字母）
          const varName = baseName.replace(/-([a-z0-9])/gi, (g) => g[1].toUpperCase());
          if (window[varName]) {
            this.posts.push(window[varName]);
          }
          resolve();
        };
        script.onerror = () => {
          console.warn(`Failed to load ${file}`);
          resolve(); // 即使失败也 resolve，不影响其他文章加载
        };
        document.head.appendChild(script);
      });
    });
    
    // 等待所有文章加载完成
    await Promise.all(loadPromises);
    
    // 按日期排序（最新的在前）
    this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  
  // 扫描 posts 目录下的文章文件
  scanPostFiles() {
    // 检查是否已经加载了配置文件
    if (typeof window !== 'undefined' && window.POST_FILES) {
      return Promise.resolve(window.POST_FILES);
    }
    
    // 如果配置文件还未加载，先加载它
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'posts/config.js';
      script.onload = () => {
        if (window.POST_FILES) {
          resolve(window.POST_FILES);
        } else {
          // 如果配置文件加载失败，返回默认列表
          resolve(['post-01.js', 'post-02.js']);
        }
      };
      script.onerror = () => {
        // 如果配置文件加载失败，返回默认列表
        resolve(['post-01.js', 'post-02.js']);
      };
      document.head.appendChild(script);
    });
  },
  
  // 获取所有博客数据（兼容原有格式）
  getBlogs() {
    return this.posts.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      summary: post.summary,
      tags: post.tags,
      content: post.content
    }));
  },
  
  // 根据slug获取文章
  getBlogBySlug(slug) {
    return this.posts.find(post => post.slug === slug);
  }
};

// 成熟的 Markdown 解析器 - 采用分层处理架构
function parseMarkdown(markdown) {
  // 预处理：统一换行符
  let content = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 第一层：保护复杂块元素（代码块、表格）
  const blocks = {
    code: [],
    table: []
  };
  
  // 1. 代码块保护
  content = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = blocks.code.length;
    blocks.code.push({ lang, code });
    return `[[[CODEBLOCK_${index}]]]`;
  });
  
  // 2. 表格保护
  content = content.replace(/(\|.*\|)\n(\|[-:\s|]+\|)\n((?:\|.*\|\n?)*)/g, (match, header, separator, rows) => {
    const index = blocks.table.length;
    blocks.table.push({ header, separator, rows });
    return `[[[TABLE_${index}]]]`;
  });
  
  // 第二层：块级元素解析
  // 3. 分割线
  content = content.replace(/^\s*(\*\*\*|---|___)\s*$/gm, '[[[HR]]]');
  
  // 4. 标题解析（按级别从高到低）
  const headings = [];
  content = content.replace(/^(#{1,6})\s+(.+?)\s*$/gm, (match, hashes, text) => {
    const level = hashes.length;
    const index = headings.length;
    headings.push({ level, text });
    return `[[[HEADING_${index}]]]`;
  });
  
  // 5. 引用块
  const blockquotes = [];
  content = content.replace(/^(> .+(?:\n> .+)*)/gm, (match) => {
    const lines = match.split('\n').map(l => l.replace(/^> /, ''));
    const index = blockquotes.length;
    blockquotes.push(lines.join('\n'));
    return `[[[BLOCKQUOTE_${index}]]]`;
  });
  
  // 6. 列表（无序）
  const ulLists = [];
  content = content.replace(/^(\s*)[-*+]\s+(.+)$/gm, (match, indent, item) => {
    const index = ulLists.length;
    ulLists.push({ indent: indent.length, item });
    return `[[[UL_${index}]]]`;
  });
  
  // 7. 列表（有序）
  const olLists = [];
  content = content.replace(/^(\s*)(\d+)\.\s+(.+)$/gm, (match, indent, num, item) => {
    const index = olLists.length;
    olLists.push({ indent: indent.length, num: parseInt(num), item });
    return `[[[OL_${index}]]]`;
  });
  
  // 第三层：行内元素解析
  // 8. 粗体和斜体（按顺序处理，避免冲突）
  content = content.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 9. 行内代码
  content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 10. 链接和图片
  content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // 11. 自动链接
  content = content.replace(/(?<!["'=\]])((https?:\/\/|www\.)[^\s<]+)/gi, (match) => {
    const url = match.startsWith('www.') ? 'http://' + match : match;
    return `<a href="${url}" target="_blank">${match}</a>`;
  });
  
  // 12. 转义字符
  content = content.replace(/\\([`*_{}\[\]()#+\-.!])/g, '$1');
  
  // 第四层：段落处理
  // 13. 分割内容为段落（保留单换行）
  const lines = content.split('\n');
  const paragraphs = [];
  let currentPara = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join('\n'));
        currentPara = [];
      }
    } else if (line.startsWith('[[[') && line.endsWith(']]]')) {
      // 特殊块元素，单独成段
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join('\n'));
        currentPara = [];
      }
      paragraphs.push(line);
    } else {
      currentPara.push(line);
    }
  }
  
  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join('\n'));
  }
  
  // 第五层：重构 HTML
  let html = '';
  
  for (const para of paragraphs) {
    if (para === '[[[HR]]]') {
      html += '<hr>';
    } else if (para.startsWith('[[[HEADING_')) {
      const index = parseInt(para.match(/\d+/)[0]);
      const heading = headings[index];
      html += `<h${heading.level}>${heading.text}</h${heading.level}>`;
    } else if (para.startsWith('[[[BLOCKQUOTE_')) {
      const index = parseInt(para.match(/\d+/)[0]);
      const content = blockquotes[index];
      // 递归解析引用内容
      const innerHtml = parseMarkdown(content);
      html += `<blockquote>${innerHtml}</blockquote>`;
    } else if (para.startsWith('[[[UL_')) {
      // 处理连续的无序列表
      const listItems = [];
      let i = paragraphs.indexOf(para);
      while (i < paragraphs.length && paragraphs[i].startsWith('[[[UL_')) {
        const index = parseInt(paragraphs[i].match(/\d+/)[0]);
        listItems.push(ulLists[index]);
        i++;
      }
      // 跳过已处理的
      const skipCount = listItems.length;
      
      // 构建嵌套列表
      html += buildList(listItems, 'ul');
      // 调整索引
      const currentIdx = paragraphs.indexOf(para);
      paragraphs.splice(currentIdx + 1, skipCount - 1);
      
    } else if (para.startsWith('[[[OL_')) {
      // 处理连续的有序列表
      const listItems = [];
      let i = paragraphs.indexOf(para);
      while (i < paragraphs.length && paragraphs[i].startsWith('[[[OL_')) {
        const index = parseInt(paragraphs[i].match(/\d+/)[0]);
        listItems.push(olLists[index]);
        i++;
      }
      const skipCount = listItems.length;
      
      html += buildList(listItems, 'ol');
      const currentIdx = paragraphs.indexOf(para);
      paragraphs.splice(currentIdx + 1, skipCount - 1);
      
    } else if (para.startsWith('[[[CODEBLOCK_')) {
      const index = parseInt(para.match(/\d+/)[0]);
      const block = blocks.code[index];
      const highlighted = highlightCode(block.code, block.lang);
      html += `<pre><code class="language-${block.lang}">${highlighted}</code></pre>`;
    } else if (para.startsWith('[[[TABLE_')) {
      const index = parseInt(para.match(/\d+/)[0]);
      const table = blocks.table[index];
      html += buildTable(table);
    } else if (para.trim() !== '') {
      // 普通段落
      html += `<p>${para}</p>`;
    }
  }
  
  return html;
}

// 构建列表（支持嵌套）
function buildList(items, type) {
  if (items.length === 0) return '';
  
  // 按缩进分组
  const groups = [];
  let currentGroup = { indent: items[0].indent, items: [items[0]] };
  
  for (let i = 1; i < items.length; i++) {
    if (items[i].indent === currentGroup.indent) {
      currentGroup.items.push(items[i]);
    } else if (items[i].indent > currentGroup.indent) {
      // 子列表开始
      const subItems = [items[i]];
      let j = i + 1;
      while (j < items.length && items[j].indent > currentGroup.indent) {
        subItems.push(items[j]);
        j++;
      }
      // 递归处理子列表
      const subList = buildList(subItems, type);
      currentGroup.items[currentGroup.items.length - 1].sublist = subList;
      i = j - 1;
    } else {
      // 缩进减少，新组开始
      groups.push(currentGroup);
      currentGroup = { indent: items[i].indent, items: [items[i]] };
    }
  }
  groups.push(currentGroup);
  
  // 构建 HTML
  let html = `<${type}>`;
  for (const group of groups) {
    for (const item of group.items) {
      const content = item.item;
      // 检查内容是否已经包含列表标记
      if (content.match(/^[-*+]\s+/) || content.match(/^\d+\.\s+/)) {
        // 移除行首的列表标记和空格
        const cleanContent = content.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '');
        html += `<li>${cleanContent}${item.sublist || ''}</li>`;
      } else {
        html += `<li>${content}${item.sublist || ''}</li>`;
      }
    }
  }
  html += `</${type}>`;
  
  return html;
}

// 构建表格
function buildTable(table) {
  const headerCells = table.header.split('|').filter(c => c.trim() !== '').map(c => c.trim());
  const separatorCells = table.separator.split('|').filter(c => c.trim() !== '');
  const rows = table.rows.trim().split('\n').filter(r => r.trim() !== '');
  
  // 分析对齐方式
  const alignments = separatorCells.map(cell => {
    const trimmed = cell.trim();
    if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
    if (trimmed.endsWith(':')) return 'right';
    return 'left';
  });
  
  let html = '<table><thead><tr>';
  headerCells.forEach((cell, i) => {
    html += `<th style="text-align: ${alignments[i] || 'left'}">${cell}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  rows.forEach(row => {
    const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
    html += '<tr>';
    cells.forEach((cell, i) => {
      html += `<td style="text-align: ${alignments[i] || 'left'}">${cell}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
}

// 代码高亮
function highlightCode(code, lang) {
  if (!code) return '';
  
  let highlighted = code
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>');
  
  if (lang === 'javascript' || lang === 'js') {
    highlighted = highlighted
      .replace(/\b(function|const|let|var|return|if|else|for|while|new|class|extends|import|export|async|await|typeof|instanceof)\b/g, '<span class="keyword">$1</span>')
      .replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>')
      .replace(/\/\/.*/g, '<span class="comment">$&</span>')
      .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
      .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="literal">$1</span>')
      .replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="function">$1</span>(');
  } else if (lang === 'css') {
    highlighted = highlighted
      .replace(/([a-z-]+)\s*:/g, '<span class="property">$1</span>:')
      .replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>')
      .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
      .replace(/#\w+/g, '<span class="color">$&</span>')
      .replace(/\b(\d+)(px|em|rem|%)\b/g, '<span class="number">$1</span><span class="unit">$2</span>');
  } else if (lang === 'html' || lang === 'xml') {
    highlighted = highlighted
      .replace(/<(\/?)([a-z-]+)/gi, '<$1<span class="tag">$2</span>')
      .replace(/([a-z-]+)=/gi, '<span class="attr">$1</span>=')
      .replace(/=['"](.*?)['"]/gi, '=<span class="value">"$1"</span>');
  }
  
  return highlighted;
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

// 兼容原有接口 - 直接引用 BlogManager 的方法
const blogs = {
  // 为了兼容原有代码，提供 map 方法
  map: function(callback) {
    return BlogManager.getBlogs().map(callback);
  },
  // 为了兼容原有代码，提供 find 方法
  find: function(callback) {
    return BlogManager.getBlogs().find(callback);
  }
};
