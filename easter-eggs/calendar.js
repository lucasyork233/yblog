// 日历彩蛋 - 显示当月日历
const CalendarEasterEgg = {
  // 渲染页面
  render(app, navigate) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const monthStr = String(month + 1).padStart(2, '0');

    app.innerHTML = `
      <div class="page calendar-page">
        <div class="card calendar-container">
          <div class="calendar-header">
            <h1 class="calendar-title" style="cursor: pointer;" data-tooltip="Back to Home">${year}-${monthStr}</h1>
          </div>
          
          <div class="calendar-grid">
            ${this.generateWeekHeader()}
            ${this.generateCalendarDays(year, month, today)}
          </div>
        </div>
      </div>
    `;

    // 绑定标题点击返回
    document.querySelector('.calendar-title').addEventListener('click', () => {
      navigate('#home');
    });
  },

  // 生成星期标题
  generateWeekHeader() {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekDays.map(day => 
      `<div class="calendar-weekday">${day}</div>`
    ).join('');
  },

  // 生成日历日期
  generateCalendarDays(year, month, today) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 将周日(0)转换为周一开始的索引(周一=0, 周日=6)
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
    
    let html = '';
    
    // 填充月初空白
    for (let i = 0; i < firstDayAdjusted; i++) {
      html += '<div class="calendar-day calendar-day-empty"></div>';
    }
    
    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today;
      const className = isToday ? 'calendar-day calendar-day-today' : 'calendar-day';
      html += `<div class="${className}">${day}</div>`;
    }
    
    return html;
  }
};

// 注册到全局
if (typeof window !== 'undefined') {
  window.CalendarEasterEgg = CalendarEasterEgg;
}
