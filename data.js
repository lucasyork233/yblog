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
    // 这里我们使用一个简单的约定：所有 post-*.js 文件都是文章
    const postFiles = await this.scanPostFiles();
    
    // 使用 Promise.all 并行加载所有文章
    const loadPromises = postFiles.map(file => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `posts/${file}`;
        script.onload = () => {
          // 从文件名提取变量名（如 post-01.js -> post01）
          const varName = file.replace('.js', '').replace('-', '');
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
  // 从配置文件中读取文章列表
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

// Markdown 解析器
function parseMarkdown(markdown) {
  let html = markdown.replace(/\\n/g, '\n');
  
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
  
  // 段落处理
  html = html.replace(/<\/pre>/g, '[[[PREEND]]]');
  html = html.replace(/<h[1-6]>/g, '[[[HEADING]]]');
  html = html.replace(/<\/h[1-6]>/g, '[[[HEADINGEND]]]');
  
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.includes('[[[PREEND]]]') || p.includes('[[[HEADING]]]')) return p;
    return `<p>${p}</p>`;
  }).join('');

  html = html.replace(/\n/g, '<br>');
  html = html.replace(/\[\[\[PREEND\]\]\]/g, '</pre>');
  html = html.replace(/\[\[\[HEADING\]\]\]/g, '');
  html = html.replace(/\[\[\[HEADINGEND\]\]\]/g, '');

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
