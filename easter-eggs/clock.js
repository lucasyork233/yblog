// 番茄时钟彩蛋
const ClockEasterEgg = {
  // 渲染页面
  render(app, navigate) {
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
      navigate('#home');
    });

    this.initClock();
  },

  // 初始化时钟逻辑
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
  }
};

// 注册到全局
if (typeof window !== 'undefined') {
  window.ClockEasterEgg = ClockEasterEgg;
}
