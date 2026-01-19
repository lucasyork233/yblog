// 路由系统

const Router = {
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  navigate(hash) {
    const app = document.getElementById('app');
    app.style.opacity = '0.7';
    app.style.transform = 'scale(0.98)';
    setTimeout(() => {
      window.location.hash = hash;
    }, 150);
  },

  handleRoute() {
    const hash = window.location.hash;
    const app = document.getElementById('app');

    // 移除可能存在的TOC
    const existingToc = document.querySelector('.toc');
    if (existingToc) {
      existingToc.remove();
    }

    // 滚动到顶部
    window.scrollTo(0, 0);

    setTimeout(() => {
      app.style.opacity = '1';
      app.style.transform = 'scale(1)';
    }, 50);

    // 如果不是博客列表页，销毁鱼动画
    if (hash !== '#blog' && typeof FISH_RENDERER !== 'undefined' && FISH_RENDERER.destroy) {
      FISH_RENDERER.destroy();
    }

    if (!hash || hash === '#home') {
      this.renderHome();
      return;
    }

    if (hash === '#blog') {
      this.renderBlogList();
      return;
    }

    if (hash === '#about') {
      this.renderAbout();
      return;
    }

    // 检查是否是彩蛋路由
    const eggMatch = hash.match(/^#(.+)$/);
    if (eggMatch) {
      const eggId = eggMatch[1];
      
      // 先检查是否是博客详情页
      if (eggId.startsWith('blog/')) {
        const slug = eggId.substring(5);
        this.renderBlogDetail(slug);
        return;
      }
      
      // 尝试渲染彩蛋
      if (typeof EasterEggManager !== 'undefined' && EasterEggManager.loaded) {
        if (EasterEggManager.hasEgg(eggId)) {
          EasterEggManager.renderEgg(eggId, app, this.navigate.bind(this));
          return;
        }
      }
    }

    this.renderHome();
  },

  renderHome() {
    const app = document.getElementById('app');
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 18) greeting = 'Good Afternoon';
    else if (hour >= 18) greeting = 'Good Evening';

    app.innerHTML = `
      <div class="page home-page">
        <div class="home-card">
          <img src="assets/avatar.jpg" alt="Avatar" class="avatar">
          <div class="greeting">${greeting}.</div>
          <div class="intro">I'm <a href="#about" class="name">LucasYork</a>.</div>
          <div class="nice-to-meet">Nice to meet you!</div>
        </div>
      </div>
    `;

    const card = app.querySelector('.home-card');
    const nameLink = app.querySelector('.name');

    card.addEventListener('click', (e) => {
      if (e.target.closest('.name') === nameLink) return;
      card.style.transform = 'scale(0.95)';
      setTimeout(() => this.navigate('#blog'), 100);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const hash = window.location.hash;
        if (hash === '' || hash === '#home') this.navigate('#blog');
      }
    });
  },

  renderBlogList() {
    const app = document.getElementById('app');
    
    // 销毁之前的鱼动画
    if (typeof FISH_RENDERER !== 'undefined' && FISH_RENDERER.destroy) {
      FISH_RENDERER.destroy();
    }
    
    const blogItems = blogs.map((blog, index) => {
      const date = formatDate(blog.date);
      const tags = blog.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');
      return `
        <a href="#blog/${blog.slug}" class="blog-item" data-slug="${blog.slug}" style="animation-delay: ${index * 0.05}s">
          <span class="blog-item-date">${date}</span>
          <span class="blog-item-title">${blog.title}</span>
          <span class="blog-item-tags">${tags}</span>
        </a>
      `;
    }).join('');

    app.innerHTML = `
      <div class="container blog-list">
        <div class="blog-list-header">
          <h1 class="blog-list-title" style="cursor: pointer;" onclick="window.location.hash='#home'">博客</h1>
        </div>
        ${blogItems || '<p style="text-align: center; color: var(--text-secondary);">暂无文章</p>'}
      </div>
      <div id="j-fish-skip" style="position: relative; height: 153px; width: 100%; margin-top: auto;"></div>
    `;

    // 初始化鱼动画
    setTimeout(() => {
      if (typeof FISH_RENDERER !== 'undefined') {
        FISH_RENDERER.init();
      }
    }, 100);

    document.querySelectorAll('.blog-item').forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = item.dataset.slug;
        item.style.transform = 'translateX(8px) scale(0.98)';
        setTimeout(() => this.navigate(`#blog/${slug}`), 100);
      });

      setTimeout(() => {
        item.style.animation = 'itemEnter 0.5s ease forwards';
      }, index * 60);
    });

    if (!document.getElementById('list-animations')) {
      const style = document.createElement('style');
      style.id = 'list-animations';
      style.textContent = `
        @keyframes itemEnter {
          from { opacity: 0; transform: translateY(10px) translateX(-5px); }
          to { opacity: 1; transform: translateY(0) translateX(0); }
        }
      `;
      document.head.appendChild(style);
    }
  },

  renderBlogDetail(slug) {
    const blog = blogs.find(b => b.slug === slug);
    if (!blog) {
      this.renderNotFound();
      return;
    }

    // 加载 HTML 文章内容
    fetch(`posts/${slug}.html`)
      .then(response => {
        if (!response.ok) {
          console.error('Failed to load article:', response.status, response.statusText);
          throw new Error('Article not found');
        }
        return response.text();
      })
      .then(html => this.renderBlogContent(blog, html))
      .catch(error => {
        console.error('Error loading article:', error);
        this.renderNotFound();
      });
  },

  renderBlogContent(blog, htmlContent) {
    // 从 HTML 中提取文章内容
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const article = doc.querySelector('article');
    if (!article) {
      this.renderNotFound();
      return;
    }

    const app = document.getElementById('app');
    const fullDate = formatDate(blog.date, 'full');
    const contentHtml = article.innerHTML;

    // 先在body创建TOC
    const tocElement = document.createElement('aside');
    tocElement.className = 'toc';
    tocElement.innerHTML = '<div class="toc-title">目录</div>';
    document.body.appendChild(tocElement);

    app.innerHTML = `
      <div class="blog-detail-page">
        <div class="container blog-detail">
          <article class="card">
            <h1 class="blog-detail-title">${blog.title}</h1>
            <p class="blog-detail-date">${fullDate}</p>
            <div class="prose">${contentHtml}</div>
            <a href="#blog" class="back-link" data-tooltip="返回列表">返回列表</a>
          </article>
        </div>
      </div>
    `;

    // 生成并渲染TOC
    this.generateAndRenderTOC();

    const backLink = app.querySelector('.back-link');
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      backLink.style.transform = 'translateX(-4px)';
      setTimeout(() => this.navigate('#blog'), 100);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.navigate('#blog');
    });

    // 代码复制功能 + 语法高亮
    setTimeout(() => {
      // 触发 Prism 高亮
      if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
      }
      
      const codeBlocks = app.querySelectorAll('pre code');
      codeBlocks.forEach(block => {
        const pre = block.parentElement;
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '复制';
        copyBtn.className = 'copy-btn';
        copyBtn.style.cssText = `
          position: absolute; top: 8px; right: 8px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid var(--accent);
          color: var(--accent);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
        `;
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);

        pre.addEventListener('mouseenter', () => copyBtn.style.opacity = '1');
        pre.addEventListener('mouseleave', () => copyBtn.style.opacity = '0');

        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(block.textContent);
            copyBtn.textContent = '已复制!';
            copyBtn.style.background = 'rgba(34, 197, 94, 0.2)';
            copyBtn.style.borderColor = '#22c55e';
            copyBtn.style.color = '#22c55e';
            setTimeout(() => {
              copyBtn.textContent = '复制';
              copyBtn.style.background = 'rgba(239, 68, 68, 0.2)';
              copyBtn.style.borderColor = 'var(--accent)';
              copyBtn.style.color = 'var(--accent)';
            }, 2000);
          } catch (err) {
            console.error('复制失败:', err);
          }
        });
      });
    }, 100);
  },

  renderNotFound() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page">
        <div class="card" style="text-align: center; max-width: 400px;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent);">404</h1>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">页面未找到</p>
          <a href="#home" class="back-link" style="margin: 0 auto;">返回首页</a>
        </div>
      </div>
    `;

    const backLink = app.querySelector('.back-link');
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate('#home');
    });
  },

  renderAbout() {
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="container about-page">
        <article class="card">
          <div class="about-header">
            <img src="assets/avatar.jpg" alt="LucasYork" class="about-avatar">
            <h1 class="about-title">About Me</h1>
          </div>
          <div class="about-content">
            <p>Hi, I'm LucasYork, a programming enthusiast.</p>
            <p>I code in C++, Golang, and Python. Beyond programming, I enjoy music, running, and reading.</p>
            <p>This blog is where I share my technical journey and thoughts.</p>
          </div>
          <a href="#home" class="back-link" data-tooltip="Back to Home">Back to Home</a>
        </article>
      </div>
    `;

    const backLink = app.querySelector('.back-link');
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      backLink.style.transform = 'translateX(-4px)';
      setTimeout(() => this.navigate('#home'), 100);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.navigate('#home');
    });
  },

  // 生成并渲染TOC
  generateAndRenderTOC() {
    const prose = document.querySelector('.prose');
    if (!prose) return;

    const headings = prose.querySelectorAll('h1, h2, h3');
    if (headings.length === 0) return;

    const tocContainer = document.querySelector('.toc');
    if (!tocContainer) return;

    // 给标题添加ID
    headings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });

    // 生成TOC HTML
    let tocHtml = '<ul class="toc-list">';

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent;
      const id = `heading-${index}`;

      if (level === 1) {
        tocHtml += `<li class="toc-item toc-h1"><a href="#${id}" class="toc-link">${text}</a></li>`;
      } else if (level === 2) {
        tocHtml += `<li class="toc-item toc-h2"><a href="#${id}" class="toc-link">${text}</a></li>`;
      } else if (level === 3) {
        tocHtml += `<li class="toc-item toc-h3"><a href="#${id}" class="toc-link">${text}</a></li>`;
      }
    });

    tocHtml += '</ul>';

    tocContainer.innerHTML = `<div class="toc-title">目录</div>${tocHtml}`;

    // 添加点击事件
    const tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 等待数据初始化完成
  if (typeof BlogManager !== 'undefined') {
    await BlogManager.init();
  }
  
  // 初始化彩蛋管理器
  if (typeof EasterEggManager !== 'undefined') {
    await EasterEggManager.init();
  }
  
  Router.init();
});
