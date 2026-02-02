// 倒计时彩蛋 - 时间进度展示
const CountdownEasterEgg = {
  render(app, navigate) {
    app.innerHTML = `
      <div class="page countdown-page">
        <div class="countdown-card">
          <div class="countdown-title" style="cursor: pointer;" data-tooltip="Back to Home">Countdown</div>
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
      </div>
    `;

    app.querySelector('.countdown-title').addEventListener('click', () => {
      navigate('#home');
    });

    this.updateProgress();

    // Update every minute
    setInterval(() => this.updateProgress(), 60000);
  },

  // Helper function for singular/plural
  pluralize(count, singular) {
    return count === 1 ? singular : singular + 's';
  },

  updateProgress() {
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
    document.getElementById('todayText').innerHTML = `Today has passed <span class="countdown-number">${hoursInt}</span> ${hoursUnit}.`;
    document.getElementById('weekText').innerHTML = `This week has passed <span class="countdown-number">${dayOfWeek}</span> ${weekUnit}.`;
    document.getElementById('monthText').innerHTML = `This month has passed <span class="countdown-number">${dayOfMonth}</span> ${monthUnit}.`;
    document.getElementById('yearText').innerHTML = `This year has passed <span class="countdown-number">${dayOfYear}</span> ${yearUnit}.`;

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
  }
};

// Register globally
if (typeof window !== 'undefined') {
  window.CountdownEasterEgg = CountdownEasterEgg;
}
