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

    // 检查是否是博客详情页
    const blogMatch = hash.match(/^#blog\/(.+)$/);
    if (blogMatch) {
      const slug = blogMatch[1];
      this.renderBlogDetail(slug);
      return;
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
          <div class="countdown-overlay">
            <div class="countdown-items">
              <div class="countdown-item">
                <div class="countdown-item-text" id="todayText"></div>
                <div class="countdown-bar">
                  <div class="countdown-progress countdown-progress-today" id="todayProgress"></div>
                </div>
              </div>
              <div class="countdown-item">
                <div class="countdown-item-text" id="weekText"></div>
                <div class="countdown-bar">
                  <div class="countdown-progress countdown-progress-week" id="weekProgress"></div>
                </div>
              </div>
              <div class="countdown-item">
                <div class="countdown-item-text" id="monthText"></div>
                <div class="countdown-bar">
                  <div class="countdown-progress countdown-progress-month" id="monthProgress"></div>
                </div>
              </div>
              <div class="countdown-item">
                <div class="countdown-item-text" id="yearText"></div>
                <div class="countdown-bar">
                  <div class="countdown-progress countdown-progress-year" id="yearProgress"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-content">
            <img src="assets/avatar.png" alt="Avatar" class="avatar">
            <div class="greeting">${greeting}.</div>
            <div class="intro">I'm <a href="#about" class="name">LucasYork</a>.</div>
            <div class="nice-to-meet">Nice to meet you!</div>
          </div>
        </div>
      </div>
    `;

    const card = app.querySelector('.home-card');
    const nameLink = app.querySelector('.name');
    const countdownOverlay = app.querySelector('.countdown-overlay');
    let isCountdownVisible = false;

    // 点击头像显示倒计时
    const avatar = app.querySelector('.avatar');
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      isCountdownVisible = !isCountdownVisible;
      
      if (isCountdownVisible) {
        countdownOverlay.classList.add('visible');
        // 更新倒计时
        this.updateCountdown();
        // 每分钟更新一次
        if (window.countdownInterval) {
          clearInterval(window.countdownInterval);
        }
        window.countdownInterval = setInterval(() => this.updateCountdown(), 60000);
      } else {
        countdownOverlay.classList.remove('visible');
        // 停止更新
        if (window.countdownInterval) {
          clearInterval(window.countdownInterval);
          window.countdownInterval = null;
        }
      }
    });

    // 点击倒计时恢复原状
    countdownOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isCountdownVisible) {
        isCountdownVisible = false;
        countdownOverlay.classList.remove('visible');
        // 停止更新
        if (window.countdownInterval) {
          clearInterval(window.countdownInterval);
          window.countdownInterval = null;
        }
      }
    });

    // 点击卡片其他部分
    card.addEventListener('click', (e) => {
      if (e.target.closest('.name') === nameLink) return;
      if (e.target === avatar) return; // 头像点击已处理
      
      if (isCountdownVisible) {
        // 如果倒计时正在显示，点击卡片隐藏倒计时
        isCountdownVisible = false;
        countdownOverlay.classList.remove('visible');
        // 停止更新
        if (window.countdownInterval) {
          clearInterval(window.countdownInterval);
          window.countdownInterval = null;
        }
      } else {
        // 如果倒计时没有显示，点击卡片跳转到博客列表
        card.style.transform = 'scale(0.95)';
        setTimeout(() => this.navigate('#blog'), 100);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const hash = window.location.hash;
        if (hash === '' || hash === '#home') this.navigate('#blog');
      }
    });
  },

  renderBlogList(searchQuery = '') {
    const app = document.getElementById('app');
    
    // 销毁之前的鱼动画
    if (typeof FISH_RENDERER !== 'undefined' && FISH_RENDERER.destroy) {
      FISH_RENDERER.destroy();
    }
    
    const filteredBlogs = searchQuery
      ? blogs.filter(blog => blog.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : blogs;
    
    const blogItems = filteredBlogs.map((blog, index) => {
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

    const searchValue = searchQuery.replace(/"/g, '&quot;');
    const hasResults = blogItems || '';
    const showFish = !searchQuery;

    app.innerHTML = `
      <div class="container blog-list">
        <div class="blog-list-header">
          <h1 class="blog-list-title" style="cursor: pointer;" onclick="window.location.href='/'">博客</h1>
        </div>
        <div class="blog-search-wrapper">
          <input type="text" class="blog-search-input" placeholder="Search Titles..." value="${searchValue}" autocomplete="off" />
          <button class="blog-search-clear" type="button" style="${searchQuery ? '' : 'display: none;'}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        ${hasResults || '<p class="blog-no-results">No articles found</p>'}
      </div>
      ${showFish ? '<div id="j-fish-skip" style="position: relative; height: 153px; width: 100%; margin-top: auto;"></div>' : ''}
    `;

    // 搜索功能 - 回车触发
    const searchInput = app.querySelector('.blog-search-input');
    const clearBtn = app.querySelector('.blog-search-clear');

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        this.renderBlogList(query);
      }
    });

    clearBtn.addEventListener('click', () => {
      this.renderBlogList('');
      const newInput = app.querySelector('.blog-search-input');
      if (newInput) newInput.focus();
    });

    // 初始化鱼动画
    if (showFish) {
      setTimeout(() => {
        if (typeof FISH_RENDERER !== 'undefined') {
          FISH_RENDERER.init();
        }
      }, 100);
    }

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
            <a href="#blog" class="back-link">返回列表</a>
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
          <a href="/" class="back-link" style="margin: 0 auto;">返回首页</a>
        </div>
      </div>
    `;

    const backLink = app.querySelector('.back-link');
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/';
    });
  },

  renderAbout() {
    const app = document.getElementById('app');

    // <img src="assets/avatar.png" alt="Avatar" class="avatar">
    // <img src="https://user1481.cn.imgto.link/blog_lucky/20260206/head-02.avif" alt="LucasYork" class="about-avatar">
    app.innerHTML = `
      <div class="container about-page">
        <article class="card">
          <div class="about-header">
            <img src="assets/avatar.png" alt="Avatar" class="avatar">
            <h1 class="about-title">About Me</h1>
          </div>
          <div class="about-content">
            <p>Hi, I'm LucasYork, a programming enthusiast.</p>
            <p>I code in C++, Golang, and Python. Beyond programming, I enjoy music, running, and reading.</p>
            <p>This blog is where I share my technical journey and thoughts.</p>
          </div>
          <a href="/" class="back-link">Back to Home</a>
        </article>
      </div>
    `;

    const backLink = app.querySelector('.back-link');
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      backLink.style.transform = 'translateX(-4px)';
      setTimeout(() => window.location.href = '/', 100);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.location.href = '/';
    });
  },

  // 倒计时更新函数
  updateCountdown() {
    const now = new Date();

    // Today progress (hours passed / 24 hours)
    const hoursPassed = now.getHours() + now.getMinutes() / 60;
    const hoursInt = Math.floor(hoursPassed);
    const todayProgress = (hoursPassed / 24) * 100;
    const hoursUnit = this.pluralize(hoursInt, 'hour');

    // Week progress (current day of week / 7 days)
    // Sunday = 0, Monday = 1, ..., Saturday = 6
    // We want Monday = 1, Sunday = 7
    let dayOfWeek = now.getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    const weekProgress = (dayOfWeek / 7) * 100;
    const weekUnit = this.pluralize(dayOfWeek, 'day');

    // Month progress (current day / days in month)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const monthProgress = (dayOfMonth / daysInMonth) * 100;
    const monthUnit = this.pluralize(dayOfMonth, 'day');

    // Year progress (day of year / 365 or 366)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const daysInYear = new Date(now.getFullYear(), 11, 31).getDate() === 31 ? 365 : 366;
    const yearProgress = (dayOfYear / daysInYear) * 100;
    const yearUnit = this.pluralize(dayOfYear, 'day');

    // Update text with colored numbers
    const todayText = document.getElementById('todayText');
    const weekText = document.getElementById('weekText');
    const monthText = document.getElementById('monthText');
    const yearText = document.getElementById('yearText');

    if (todayText) todayText.innerHTML = `Today has passed <span class="countdown-number">${hoursInt}</span> ${hoursUnit}.`;
    if (weekText) weekText.innerHTML = `This week has passed <span class="countdown-number">${dayOfWeek}</span> ${weekUnit}.`;
    if (monthText) monthText.innerHTML = `This month has passed <span class="countdown-number">${dayOfMonth}</span> ${monthUnit}.`;
    if (yearText) yearText.innerHTML = `This year has passed <span class="countdown-number">${dayOfYear}</span> ${yearUnit}.`;

    // Update progress bars
    const updateBar = (id, progress) => {
      const bar = document.getElementById(id);
      if (bar) {
        bar.style.width = `${progress}%`;
      }
    };

    updateBar('todayProgress', todayProgress);
    updateBar('weekProgress', weekProgress);
    updateBar('monthProgress', monthProgress);
    updateBar('yearProgress', yearProgress);
  },

  // Helper function for singular/plural
  pluralize(count, singular) {
    return count === 1 ? singular : singular + 's';
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
  
  Router.init();
});
