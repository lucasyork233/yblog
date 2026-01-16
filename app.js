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

    if (hash === '#clock') {
      this.renderClock();
      return;
    }

    if (hash === '#events') {
      this.renderEvents();
      return;
    }

    const detailMatch = hash.match(/^#blog\/(.+)$/);
    if (detailMatch) {
      const slug = detailMatch[1];
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

    const app = document.getElementById('app');
    const fullDate = formatDate(blog.date, 'full');
    const contentHtml = parseMarkdown(blog.content);

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

    // 代码复制功能
    setTimeout(() => {
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

  renderClock() {
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="page clock-page">
        <div class="clock-container">
          <div class="tomato-label" style="cursor: pointer;" data-tooltip="Back to Home">tomato</div>
          <div class="timer-display" id="timer">25:00</div>
          <div class="button-container">
            <button class="btn btn-start" id="startBtn">start</button>
            <button class="btn btn-stop hidden" id="stopBtn">stop</button>
            <button class="btn btn-reset hidden" id="resetBtn">reset</button>
          </div>
        </div>
      </div>
    `;

    app.querySelector('.tomato-label').addEventListener('click', () => {
      this.navigate('#home');
    });

    this.initClock();
  },

  initClock() {
    let totalTime = 25 * 60;
    let timeLeft = totalTime;
    let startTime = null;
    let pausedTime = 0;
    let timerInterval = null;
    let isRunning = false;

    const updateDisplay = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const timerEl = document.getElementById('timer');
      if (timerEl) timerEl.textContent = display;
    };

    const calculateTimeLeft = () => {
      if (!isRunning || !startTime) return;

      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      timeLeft = Math.max(0, totalTime - pausedTime - elapsed);

      if (timeLeft <= 0) {
        stopTimer();
        alert('番茄时间结束！');
      }
    };

    const startTimer = () => {
      if (!isRunning) {
        isRunning = true;
        startTime = Date.now();

        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('stopBtn').classList.remove('hidden');
        document.getElementById('resetBtn').classList.remove('hidden');

        timerInterval = setInterval(() => {
          calculateTimeLeft();
          updateDisplay();
        }, 100);
      }
    };

    const stopTimer = () => {
      if (isRunning) {
        isRunning = false;

        if (startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          pausedTime += elapsed;
        }

        clearInterval(timerInterval);
        startTime = null;

        document.getElementById('startBtn').classList.remove('hidden');
        document.getElementById('stopBtn').classList.add('hidden');
        document.getElementById('resetBtn').classList.add('hidden');
      }
    };

    const resetTimer = () => {
      stopTimer();
      timeLeft = totalTime;
      pausedTime = 0;
      updateDisplay();
    };

    document.getElementById('startBtn').addEventListener('click', startTimer);
    document.getElementById('stopBtn').addEventListener('click', stopTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isRunning) {
        calculateTimeLeft();
        updateDisplay();
      }
    });

    window.addEventListener('focus', () => {
      if (isRunning) {
        calculateTimeLeft();
        updateDisplay();
      }
    });

    updateDisplay();
  },

  renderEvents() {
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="page events-page">
        <div class="events-container">
          <header>
            <h1 style="cursor: pointer;" data-tooltip="Back to Home">Daily Event List</h1>
            <p>from old to new + DIY sort</p>
            <div class="header-buttons">
              <button id="addEventBtn" class="add-btn">+</button>
              <button id="clearAllBtn" class="clear-btn" title="clear all events">Clear</button>
            </div>
          </header>

          <div class="events-list">
            <div id="eventsContainer"></div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div id="eventModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modalTitle">Add new event</h2>
            <span class="close">&times;</span>
          </div>
          <form id="eventForm">
            <input type="hidden" id="eventId">
            <div class="form-group">
              <label for="eventName">Event name *</label>
              <input type="text" id="eventName" required>
            </div>
            <div class="form-group">
              <label for="eventNote">Note</label>
              <textarea id="eventNote" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn">Cancel</button>
              <button type="submit" class="submit-btn" id="submitBtn">Add event</button>
            </div>
          </form>
        </div>
      </div>
    `;

    app.querySelector('header h1').addEventListener('click', () => {
      this.navigate('#home');
    });

    this.initEvents();
  },

  initEvents() {
    let events = [];

    const loadEventsFromStorage = () => {
      const storedEvents = localStorage.getItem('thingListEvents');
      if (storedEvents) {
        try {
          events = JSON.parse(storedEvents);
          events.forEach((event, index) => {
            if (event.sort_order === undefined) {
              event.sort_order = index;
            }
            if (event.completed === undefined) {
              event.completed = false;
            }
          });
        } catch (e) {
          console.error('Failed to parse stored events:', e);
          events = [];
        }
      }
    };

    const saveEventsToStorage = () => {
      localStorage.setItem('thingListEvents', JSON.stringify(events));
    };

    const escapeHtml = (text) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    };

    const renderEvents = () => {
      const container = document.getElementById('eventsContainer');
      if (!container) return;

      container.innerHTML = '';

      const sortedEvents = [...events].sort((a, b) => {
        if (a.sort_order !== undefined && b.sort_order !== undefined &&
          typeof a.sort_order === 'number' && typeof b.sort_order === 'number') {
          return a.sort_order - b.sort_order;
        }
        return new Date(a.create_time) - new Date(b.create_time);
      });

      if (sortedEvents.length === 0) {
        container.innerHTML = '<div class="empty-state">No events, please add new event</div>';
        return;
      }

      sortedEvents.forEach((event, index) => {
        const eventElement = createEventElement(event, index + 1);
        container.appendChild(eventElement);
      });
    };

    const createEventElement = (event, rank) => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event-item';
      if (event.completed) {
        eventDiv.classList.add('completed');
      }
      eventDiv.dataset.id = event.id;
      eventDiv.draggable = true;

      const createDate = new Date(event.create_time);
      const formattedDate = `${createDate.getFullYear()}-${(createDate.getMonth() + 1).toString().padStart(2, '0')}-${createDate.getDate().toString().padStart(2, '0')}`;

      eventDiv.innerHTML = `
        <div class="event-number">${rank}</div>
        <div class="drag-handle">⋮⋮</div>
        <div class="event-actions">
          <button class="edit-btn" data-id="${event.id}">✎</button>
          <button class="delete-btn" data-id="${event.id}">×</button>
        </div>
        <div class="event-header">
          <div class="event-name" title="Double-click to toggle completion status">${escapeHtml(event.name)}</div>
          <div class="event-date">${formattedDate}</div>
        </div>
        ${event.note ? `<div class="event-note">${escapeHtml(event.note)}</div>` : ''}
      `;

      const editBtn = eventDiv.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => openModal(event.id));

      const deleteBtn = eventDiv.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => deleteEvent(event.id));

      const eventName = eventDiv.querySelector('.event-name');
      eventName.addEventListener('dblclick', () => toggleComplete(event.id));

      eventDiv.addEventListener('dragstart', handleDragStart);
      eventDiv.addEventListener('dragend', handleDragEnd);
      eventDiv.addEventListener('dragover', handleDragOver);
      eventDiv.addEventListener('drop', handleDrop);
      eventDiv.addEventListener('dragenter', handleDragEnter);
      eventDiv.addEventListener('dragleave', handleDragLeave);

      return eventDiv;
    };

    const toggleComplete = (id) => {
      const event = events.find(e => e.id === id);
      if (event) {
        event.completed = !event.completed;
        saveEventsToStorage();
        renderEvents();
      }
    };

    let draggedElement = null;

    const handleDragStart = (e) => {
      draggedElement = e.currentTarget;
      draggedElement.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = (e) => {
      if (draggedElement) {
        draggedElement.classList.remove('dragging');
        document.querySelectorAll('.event-item').forEach(item => {
          item.classList.remove('drag-over');
        });
      }
    };

    const handleDragOver = (e) => {
      if (e.preventDefault) e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return false;
    };

    const handleDragEnter = (e) => {
      if (draggedElement !== e.currentTarget) {
        e.currentTarget.classList.add('drag-over');
      }
    };

    const handleDragLeave = (e) => {
      e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
      if (e.stopPropagation) e.stopPropagation();

      if (draggedElement !== e.currentTarget) {
        const draggedId = parseInt(draggedElement.dataset.id);
        const targetId = parseInt(e.currentTarget.dataset.id);
        reorderEvents(draggedId, targetId);
      }
      return false;
    };

    const reorderEvents = (draggedId, targetId) => {
      const sortedEvents = [...events].sort((a, b) => {
        if (a.sort_order !== undefined && b.sort_order !== undefined &&
          typeof a.sort_order === 'number' && typeof b.sort_order === 'number') {
          return a.sort_order - b.sort_order;
        }
        return new Date(a.create_time) - new Date(b.create_time);
      });

      const draggedIndex = sortedEvents.findIndex(event => event.id === draggedId);
      const targetIndex = sortedEvents.findIndex(event => event.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedEvent] = sortedEvents.splice(draggedIndex, 1);
        sortedEvents.splice(targetIndex, 0, draggedEvent);

        sortedEvents.forEach((event, index) => {
          const originalEvent = events.find(e => e.id === event.id);
          if (originalEvent) {
            originalEvent.sort_order = index;
          }
        });

        saveEventsToStorage();
        renderEvents();
      }
    };

    const deleteEvent = (id) => {
      if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(event => event.id !== id);

        const sortedEvents = [...events].sort((a, b) => {
          if (a.sort_order !== undefined && b.sort_order !== undefined &&
            typeof a.sort_order === 'number' && typeof b.sort_order === 'number') {
            return a.sort_order - b.sort_order;
          }
          return new Date(a.create_time) - new Date(b.create_time);
        });

        sortedEvents.forEach((event, index) => {
          const originalEvent = events.find(e => e.id === event.id);
          if (originalEvent) {
            originalEvent.sort_order = index;
          }
        });

        saveEventsToStorage();
        renderEvents();
      }
    };

    const clearAllEvents = () => {
      if (events.length === 0) {
        alert('No events to clear');
        return;
      }

      const confirmClear = confirm(`Are you sure you want to clear all ${events.length} events?\n\nThis action cannot be undone!`);

      if (confirmClear) {
        const finalConfirm = confirm('Please confirm again: Are you sure you want to clear all events?');

        if (finalConfirm) {
          events = [];
          localStorage.removeItem('thingListEvents');
          renderEvents();
          alert('All events have been cleared');
        }
      }
    };

    const modal = document.getElementById('eventModal');
    const eventForm = document.getElementById('eventForm');
    const eventNameInput = document.getElementById('eventName');
    const eventNoteInput = document.getElementById('eventNote');
    const eventIdInput = document.getElementById('eventId');
    const addEventBtn = document.getElementById('addEventBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');

    const openModal = (eventId = null) => {
      modal.style.display = 'block';
      eventForm.reset();

      if (eventId) {
        const event = events.find(e => e.id === eventId);
        if (event) {
          modalTitle.textContent = 'Edit Event';
          submitBtn.textContent = 'Save Changes';
          eventIdInput.value = event.id;
          eventNameInput.value = event.name;
          eventNoteInput.value = event.note || '';
        }
      } else {
        modalTitle.textContent = 'Add New Event';
        submitBtn.textContent = 'Add Event';
        eventIdInput.value = '';
      }
    };

    const closeModal = () => {
      modal.style.display = 'none';
    };

    addEventBtn.addEventListener('click', () => openModal());
    clearAllBtn.addEventListener('click', clearAllEvents);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = eventNameInput.value.trim();
      const note = eventNoteInput.value.trim();
      const eventId = eventIdInput.value;

      if (!name) {
        alert('Please enter event name');
        return;
      }

      if (eventId) {
        const eventIndex = events.findIndex(e => e.id === parseInt(eventId));
        if (eventIndex !== -1) {
          events[eventIndex].name = name;
          events[eventIndex].note = note;
        }
      } else {
        const newEvent = {
          id: Date.now(),
          name: name,
          note: note,
          create_time: new Date().toISOString(),
          add_time: '',
          sort_order: events.length,
          completed: false
        };
        events.push(newEvent);
      }

      saveEventsToStorage();
      renderEvents();
      closeModal();
    });

    loadEventsFromStorage();
    renderEvents();
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
  FISH_COLOR: 'rgba(66, 185, 133, 0.8)',
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
    this.startEpicenter = this.startEpicenter.bind(this);
    this.moveEpicenter = this.moveEpicenter.bind(this);
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
    this.$container.addEventListener('mouseenter', this.startEpicenter);
    this.$container.addEventListener('mousemove', this.moveEpicenter);
  },
  
  getAxis: function (t) {
    var i = this.$container.getBoundingClientRect();
    return {
      x: t.clientX - i.left + window.scrollX,
      y: t.clientY - i.top + window.scrollY
    };
  },
  
  startEpicenter: function (t) {
    this.axis = this.getAxis(t);
  },
  
  moveEpicenter: function (t) {
    var i = this.getAxis(t);
    this.axis || (this.axis = i);
    this.generateEpicenter(i.x, i.y, i.y - this.axis.y);
    this.axis = i;
  },
  
  generateEpicenter: function (t, i, e) {
    if (!(i < this.height / 2 - this.THRESHOLD || i > this.height / 2 + this.THRESHOLD)) {
      var h = Math.round(t / this.pointInterval);
      h < 0 || h >= this.points.length || this.points[h].interfere(i, e);
    }
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
    this.renderer.generateEpicenter(this.x + (this.direction ? -1 : 1) * this.renderer.THRESHOLD, this.y, this.y - this.previousY);
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
  Router.init();
});
