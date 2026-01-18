// 每日事件彩蛋
const EventsEasterEgg = {
  // 渲染页面
  render(app, navigate) {
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
      navigate('#home');
    });

    this.initEvents();
  },

  // 初始化事件列表逻辑
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

// 注册到全局
if (typeof window !== 'undefined') {
  window.EventsEasterEgg = EventsEasterEgg;
}
