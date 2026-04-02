const FitEasterEgg = {
  settings: {
    prepareTime: 10,
    workTime: 30,
    restTime: 10,
    rounds: 3
  },

  render(app, navigate) {
    const s = this.settings;
    app.innerHTML = `
      <div class="page fit-page">
        <div class="fit-container">
          <button class="fit-settings-btn" id="fitSettingsBtn" title="Settings">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <div class="fit-phase-label" id="fitPhaseLabel">ready</div>
          <div class="fit-timer-display" id="fitTimerDisplay">00:00</div>
          <div class="fit-round-indicator" id="fitRoundIndicator">round 1/${s.rounds}</div>
          <div class="fit-progress-bar">
            <div class="fit-progress-fill" id="fitProgressFill"></div>
          </div>
          <div class="fit-buttons">
            <button class="fit-btn fit-btn-start" id="fitStartBtn">start</button>
            <button class="fit-btn fit-btn-reset hidden" id="fitResetBtn">reset</button>
          </div>
        </div>
      </div>
      <div class="modal" id="fitSettingsModal">
        <div class="modal-content fit-modal">
          <div class="modal-header">
            <h2>Settings</h2>
            <span class="close" id="fitModalClose">&times;</span>
          </div>
          <div class="form-group">
            <label>Prepare Time (s)</label>
            <input type="number" id="fitPrepareTime" value="${s.prepareTime}" min="0" max="60" />
          </div>
          <div class="form-group">
            <label>Work Time (s)</label>
            <input type="number" id="fitWorkTime" value="${s.workTime}" min="1" max="300" />
          </div>
          <div class="form-group">
            <label>Rest Time (s)</label>
            <input type="number" id="fitRestTime" value="${s.restTime}" min="1" max="120" />
          </div>
          <div class="form-group">
            <label>Rounds</label>
            <input type="number" id="fitRounds" value="${s.rounds}" min="1" max="20" />
          </div>
          <div class="form-actions">
            <button class="fit-btn fit-btn-save" id="fitSaveSettings">Save</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(navigate);
  },

  bindEvents(navigate) {
    document.getElementById('fitSettingsBtn').addEventListener('click', () => {
      document.getElementById('fitSettingsModal').style.display = 'block';
    });

    document.getElementById('fitModalClose').addEventListener('click', () => {
      document.getElementById('fitSettingsModal').style.display = 'none';
    });

    document.getElementById('fitSettingsModal').addEventListener('click', (e) => {
      if (e.target.id === 'fitSettingsModal') {
        e.target.style.display = 'none';
      }
    });

    document.getElementById('fitSaveSettings').addEventListener('click', () => {
      this.settings.prepareTime = Math.max(0, parseInt(document.getElementById('fitPrepareTime').value) || 0);
      this.settings.workTime = Math.max(1, parseInt(document.getElementById('fitWorkTime').value) || 30);
      this.settings.restTime = Math.max(1, parseInt(document.getElementById('fitRestTime').value) || 10);
      this.settings.rounds = Math.max(1, parseInt(document.getElementById('fitRounds').value) || 3);
      document.getElementById('fitSettingsModal').style.display = 'none';
      this.reset();
    });

    document.getElementById('fitStartBtn').addEventListener('click', () => {
      this.start();
    });

    document.getElementById('fitResetBtn').addEventListener('click', () => {
      this.reset();
    });
  },

  timer: null,
  running: false,
  currentRound: 1,
  phase: 'idle',
  timeLeft: 0,
  phaseTotal: 0,

  start() {
    if (this.running) return;
    this.running = true;
    this.currentRound = 1;

    const s = this.settings;
    if (s.prepareTime > 0) {
      this.phase = 'prepare';
      this.timeLeft = s.prepareTime;
      this.phaseTotal = s.prepareTime;
    } else {
      this.phase = 'work';
      this.timeLeft = s.workTime;
      this.phaseTotal = s.workTime;
    }

    document.getElementById('fitStartBtn').classList.add('hidden');
    document.getElementById('fitResetBtn').classList.remove('hidden');

    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  },

  tick() {
    const s = this.settings;
    const display = document.getElementById('fitTimerDisplay');
    const label = document.getElementById('fitPhaseLabel');
    const round = document.getElementById('fitRoundIndicator');
    const progress = document.getElementById('fitProgressFill');

    const mins = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const secs = (this.timeLeft % 60).toString().padStart(2, '0');
    display.textContent = `${mins}:${secs}`;

    round.textContent = `round ${this.currentRound}/${s.rounds}`;

    const pct = ((this.phaseTotal - this.timeLeft) / this.phaseTotal) * 100;
    progress.style.width = `${pct}%`;

    if (this.timeLeft <= 3 && this.timeLeft > 0) {
      display.classList.add('fit-blink');
    } else {
      display.classList.remove('fit-blink');
    }

    switch (this.phase) {
      case 'prepare':
        label.textContent = 'get ready';
        label.className = 'fit-phase-label fit-phase-prepare';
        display.className = 'fit-timer-display fit-timer-prepare';
        progress.className = 'fit-progress-fill fit-progress-prepare';
        break;
      case 'work':
        label.textContent = 'work';
        label.className = 'fit-phase-label fit-phase-work';
        display.className = 'fit-timer-display fit-timer-work';
        progress.className = 'fit-progress-fill fit-progress-work';
        break;
      case 'rest':
        label.textContent = 'rest';
        label.className = 'fit-phase-label fit-phase-rest';
        display.className = 'fit-timer-display fit-timer-rest';
        progress.className = 'fit-progress-fill fit-progress-rest';
        break;
    }

    this.timeLeft--;

    if (this.timeLeft < 0) {
      this.nextPhase();
    }
  },

  nextPhase() {
    const s = this.settings;

    if (this.phase === 'prepare') {
      this.phase = 'work';
      this.timeLeft = s.workTime;
      this.phaseTotal = s.workTime;
    } else if (this.phase === 'work') {
      if (this.currentRound >= s.rounds) {
        this.finish();
        return;
      }
      this.phase = 'rest';
      this.timeLeft = s.restTime;
      this.phaseTotal = s.restTime;
    } else if (this.phase === 'rest') {
      this.currentRound++;
      this.phase = 'work';
      this.timeLeft = s.workTime;
      this.phaseTotal = s.workTime;
    }

    document.getElementById('fitTimerDisplay').classList.remove('fit-blink');
    this.tick();
  },

  finish() {
    clearInterval(this.timer);
    this.timer = null;
    this.running = false;

    const display = document.getElementById('fitTimerDisplay');
    const label = document.getElementById('fitPhaseLabel');
    const progress = document.getElementById('fitProgressFill');

    display.textContent = '00:00';
    display.className = 'fit-timer-display fit-timer-done';
    display.classList.remove('fit-blink');
    label.textContent = 'done!';
    label.className = 'fit-phase-label fit-phase-done';
    progress.style.width = '100%';
    progress.className = 'fit-progress-fill fit-progress-done';

    document.getElementById('fitStartBtn').classList.remove('hidden');
    document.getElementById('fitStartBtn').textContent = 'restart';
    document.getElementById('fitResetBtn').classList.add('hidden');
  },

  reset() {
    clearInterval(this.timer);
    this.timer = null;
    this.running = false;
    this.currentRound = 1;
    this.phase = 'idle';
    this.timeLeft = 0;

    const display = document.getElementById('fitTimerDisplay');
    const label = document.getElementById('fitPhaseLabel');
    const round = document.getElementById('fitRoundIndicator');
    const progress = document.getElementById('fitProgressFill');

    display.textContent = '00:00';
    display.className = 'fit-timer-display';
    label.textContent = 'ready';
    label.className = 'fit-phase-label';
    round.textContent = `round 1/${this.settings.rounds}`;
    progress.style.width = '0%';
    progress.className = 'fit-progress-fill';

    document.getElementById('fitStartBtn').classList.remove('hidden');
    document.getElementById('fitStartBtn').textContent = 'start';
    document.getElementById('fitResetBtn').classList.add('hidden');
  }
};

if (typeof window !== 'undefined') {
  window.FitEasterEgg = FitEasterEgg;
}
