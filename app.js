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
          <img src="avatar.jpg" alt="Avatar" class="avatar">
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
            <img src="avatar.jpg" alt="LucasYork" class="about-avatar">
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

// 鱼游动动画
var FISH_RENDERER = {
  POINT_INTERVAL: 5,
  FISH_COUNT: 3,
  MAX_INTERVAL_COUNT: 50,
  INIT_HEIGHT_RATE: .5,
  THRESHOLD: 50,
  WATCH_INTERVAL: 100,
  FISH_COLOR: 'rgba(30, 120, 200, 0.8)',
  animationId: null,
  
  init: function () {
    this.setParameters();
    this.reconstructMethods();
    this.setup();
    this.bindEvent();
    this.render();
  },
  
  destroy: function () {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.points = [];
    this.fishes = [];
  },
  
  setParameters: function () {
    this.$container = document.getElementById('j-fish-skip');
    if (!this.$container) return;
    this.$canvas = document.createElement('canvas');
    this.context = this.$canvas.getContext('2d');
    this.$container.appendChild(this.$canvas);
    this.points = [];
    this.fishes = [];
    this.watchIds = [];
  },
  
  createSurfacePoints: function () {
    var t = Math.round(this.width / this.POINT_INTERVAL);
    this.pointInterval = this.width / (t - 1);
    this.points.push(new FISH_SURFACE_POINT(this, 0));
    for (var i = 1; i < t; i++) {
      var e = new FISH_SURFACE_POINT(this, i * this.pointInterval),
        h = this.points[i - 1];
      e.setPreviousPoint(h);
      h.setNextPoint(e);
      this.points.push(e);
    }
  },
  
  reconstructMethods: function () {
    this.watchWindowSize = this.watchWindowSize.bind(this);
    this.jdugeToStopResize = this.jdugeToStopResize.bind(this);
    this.render = this.render.bind(this);
  },
  
  setup: function () {
    if (!this.$container) return;
    this.points.length = 0;
    this.fishes.length = 0;
    this.watchIds.length = 0;
    this.intervalCount = this.MAX_INTERVAL_COUNT;
    this.width = this.$container.offsetWidth;
    this.height = this.$container.offsetHeight;
    this.fishCount = Math.floor(this.FISH_COUNT * this.width / 500 * this.height / 500);
    this.$canvas.width = this.width;
    this.$canvas.height = this.height;
    this.reverse = false;
    this.fishes.push(new FISH_FISH(this));
    this.createSurfacePoints();
  },
  
  watchWindowSize: function () {
    this.clearTimer();
    this.tmpWidth = window.innerWidth;
    this.tmpHeight = window.innerHeight;
    this.watchIds.push(setTimeout(this.jdugeToStopResize, this.WATCH_INTERVAL));
  },
  
  clearTimer: function () {
    while (this.watchIds.length > 0) {
      clearTimeout(this.watchIds.pop());
    }
  },
  
  jdugeToStopResize: function () {
    var t = window.innerWidth,
      i = window.innerHeight,
      e = t == this.tmpWidth && i == this.tmpHeight;
    this.tmpWidth = t;
    this.tmpHeight = i;
    e && this.setup();
  },
  
  bindEvent: function () {
    if (!this.$container) return;
    window.addEventListener('resize', this.watchWindowSize);
  },
  
  controlStatus: function () {
    for (var t = 0, i = this.points.length; t < i; t++) {
      this.points[t].updateSelf();
    }
    for (t = 0, i = this.points.length; t < i; t++) {
      this.points[t].updateNeighbors();
    }
    this.fishes.length < this.fishCount && 0 == --this.intervalCount && (this.intervalCount = this.MAX_INTERVAL_COUNT, this.fishes.push(new FISH_FISH(this)));
  },
  
  render: function () {
    this.animationId = requestAnimationFrame(this.render);
    this.controlStatus();
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = this.FISH_COLOR;
    for (var t = 0, i = this.fishes.length; t < i; t++) {
      this.fishes[t].render(this.context);
    }
    this.context.save();
    this.context.globalCompositeOperation = 'xor';
    this.context.beginPath();
    this.context.moveTo(0, this.reverse ? 0 : this.height);
    for (t = 0, i = this.points.length; t < i; t++) {
      this.points[t].render(this.context);
    }
    this.context.lineTo(this.width, this.reverse ? 0 : this.height);
    this.context.closePath();
    this.context.fill();
    this.context.restore();
  }
};

var FISH_SURFACE_POINT = function (t, i) {
  this.renderer = t;
  this.x = i;
  this.init();
};

FISH_SURFACE_POINT.prototype = {
  SPRING_CONSTANT: .03,
  SPRING_FRICTION: .9,
  WAVE_SPREAD: .3,
  ACCELARATION_RATE: .01,
  
  init: function () {
    this.initHeight = this.renderer.height * this.renderer.INIT_HEIGHT_RATE;
    this.height = this.initHeight;
    this.fy = 0;
    this.force = {
      previous: 0,
      next: 0
    };
  },
  
  setPreviousPoint: function (t) {
    this.previous = t;
  },
  
  setNextPoint: function (t) {
    this.next = t;
  },
  
  interfere: function (t, i) {
    this.fy = this.renderer.height * this.ACCELARATION_RATE * (this.renderer.height - this.height - t >= 0 ? -1 : 1) * Math.abs(i);
  },
  
  updateSelf: function () {
    this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height);
    this.fy *= this.SPRING_FRICTION;
    this.height += this.fy;
  },
  
  updateNeighbors: function () {
    this.previous && (this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height));
    this.next && (this.force.next = this.WAVE_SPREAD * (this.height - this.next.height));
  },
  
  render: function (t) {
    this.previous && (this.previous.height += this.force.previous, this.previous.fy += this.force.previous);
    this.next && (this.next.height += this.force.next, this.next.fy += this.force.next);
    t.lineTo(this.x, this.renderer.height - this.height);
  }
};

var FISH_FISH = function (t) {
  this.renderer = t;
  this.init();
};

FISH_FISH.prototype = {
  GRAVITY: .4,
  
  init: function () {
    this.direction = Math.random() < .5;
    this.x = this.direction ? this.renderer.width + this.renderer.THRESHOLD : -this.renderer.THRESHOLD;
    this.previousY = this.y;
    this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1);
    this.renderer.reverse ? (this.y = this.getRandomValue(1 * this.renderer.height / 10, 4 * this.renderer.height / 10), this.vy = this.getRandomValue(2, 5), this.ay = this.getRandomValue(.05, .2)) : (this.y = this.getRandomValue(6 * this.renderer.height / 10, 9 * this.renderer.height / 10), this.vy = this.getRandomValue(-5, -2), this.ay = this.getRandomValue(-.2, -.05));
    this.isOut = false;
    this.theta = 0;
    this.phi = 0;
  },
  
  getRandomValue: function (t, i) {
    return t + (i - t) * Math.random();
  },
  
  reverseVertical: function () {
    this.isOut = !this.isOut;
    this.ay *= -1;
  },
  
  controlStatus: function (t) {
    this.previousY = this.y;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.ay;
    this.renderer.reverse ? this.y > this.renderer.height * this.renderer.INIT_HEIGHT_RATE ? (this.vy -= this.GRAVITY, this.isOut = true) : (this.isOut && (this.ay = this.getRandomValue(.05, .2)), this.isOut = false) : this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE ? (this.vy += this.GRAVITY, this.isOut = true) : (this.isOut && (this.ay = this.getRandomValue(-.2, -.05)), this.isOut = false);
    this.isOut || (this.theta += Math.PI / 20, this.theta %= 2 * Math.PI, this.phi += Math.PI / 30, this.phi %= 2 * Math.PI);
    (this.vx > 0 && this.x > this.renderer.width + this.renderer.THRESHOLD || this.vx < 0 && this.x < -this.renderer.THRESHOLD) && this.init();
  },
  
  render: function (t) {
    t.save();
    t.translate(this.x, this.y);
    t.rotate(Math.PI + Math.atan2(this.vy, this.vx));
    t.scale(1, this.direction ? 1 : -1);
    t.beginPath();
    t.moveTo(-30, 0);
    t.bezierCurveTo(-20, 15, 15, 10, 40, 0);
    t.bezierCurveTo(15, -10, -20, -15, -30, 0);
    t.fill();
    t.save();
    t.translate(40, 0);
    t.scale(.9 + .2 * Math.sin(this.theta), 1);
    t.beginPath();
    t.moveTo(0, 0);
    t.quadraticCurveTo(5, 10, 20, 8);
    t.quadraticCurveTo(12, 5, 10, 0);
    t.quadraticCurveTo(12, -5, 20, -8);
    t.quadraticCurveTo(5, -10, 0, 0);
    t.fill();
    t.restore();
    t.save();
    t.translate(-3, 0);
    t.rotate((Math.PI / 3 + Math.PI / 10 * Math.sin(this.phi)) * (this.renderer.reverse ? -1 : 1));
    t.beginPath();
    this.renderer.reverse ? (t.moveTo(5, 0), t.bezierCurveTo(10, 10, 10, 30, 0, 40), t.bezierCurveTo(-12, 25, -8, 10, 0, 0)) : (t.moveTo(-5, 0), t.bezierCurveTo(-10, -10, -10, -30, 0, -40), t.bezierCurveTo(12, -25, 8, -10, 0, 0));
    t.closePath();
    t.fill();
    t.restore();
    t.restore();
    this.controlStatus(t);
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
