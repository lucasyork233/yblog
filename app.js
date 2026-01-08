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

    setTimeout(() => {
      app.style.opacity = '1';
      app.style.transform = 'scale(1)';
    }, 50);

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
    `;

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

        app.innerHTML = `
          <div class="container blog-detail">
            <article class="card">
              <h1 class="blog-detail-title">${blog.title}</h1>
              <p class="blog-detail-date">${fullDate}</p>
              <div class="prose">${contentHtml}</div>
              <a href="#blog" class="back-link" data-tooltip="返回列表">返回列表</a>
            </article>
          </div>
        `;

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
