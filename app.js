// 简单的路由系统 - 使用 hash 路由避免静态文件 404 问题
const Router = {
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  handleRoute() {
    const hash = window.location.hash;

    // 首页（没有 hash 或是 #home）
    if (!hash || hash === '#home') {
      this.renderHome();
      return;
    }

    // 博客列表页
    if (hash === '#blog') {
      this.renderBlogList();
      return;
    }

    // 博客详情页 #blog/hello-world
    const detailMatch = hash.match(/^#blog\/(.+)$/);
    if (detailMatch) {
      const slug = detailMatch[1];
      this.renderBlogDetail(slug);
      return;
    }

    // 默认首页
    this.renderHome();
  },

  renderHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page home-page">
        <div class="card">
          <h1 class="home-title">yBlog</h1>
        </div>
      </div>
    `;

    // 点击卡片跳转到博客列表
    const card = app.querySelector('.card');
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => this.navigate('#blog'));
  },

  renderBlogList() {
    const app = document.getElementById('app');
    const blogItems = blogs.map(blog => {
      const date = formatDate(blog.date);
      const tags = blog.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');

      return `
        <a href="#blog/${blog.slug}" class="card blog-item" data-slug="${blog.slug}">
          <span class="blog-item-date">${date}</span>
          <span class="blog-item-title">${blog.title}</span>
          <span class="blog-item-tags">${tags}</span>
        </a>
      `;
    }).join('');

    app.innerHTML = `
      <div class="container blog-list">
        <div class="blog-list-header">
          <h1 class="blog-list-title">博客</h1>
        </div>
        ${blogItems}
      </div>
    `;

    // 绑定点击事件
    document.querySelectorAll('.blog-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = item.dataset.slug;
        this.navigate(`#blog/${slug}`);
      });
    });
  },

  renderBlogDetail(slug) {
    const blog = blogs.find(b => b.slug === slug);

    if (!blog) {
      this.renderNotFound();
      return;
    }

    const app = document.getElementById('app');
    const fullDate = formatDate(blog.date, 'full');
    const contentHtml = parseMarkdown(blog.content);

    app.innerHTML = `
      <div class="container blog-detail">
        <a href="#blog" class="back-link">← 返回列表</a>
        <article class="card">
          <h1 class="blog-detail-title">${blog.title}</h1>
          <p class="blog-detail-date">${fullDate}</p>
          <div class="prose">${contentHtml}</div>
        </article>
      </div>
    `;

    // 绑定返回链接
    const backLink = app.querySelector('.back-link');
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate('#blog');
    });
  },

  renderNotFound() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page">
        <div class="card">
          <h1 style="text-align: center;">404</h1>
          <p style="text-align: center; color: var(--secondary);">页面未找到</p>
          <p style="text-align: center; margin-top: 1rem;">
            <a href="#home" style="color: var(--primary);">返回首页</a>
          </p>
        </div>
      </div>
    `;
  }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  Router.init();
});
