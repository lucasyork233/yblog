// 彩蛋配置文件
// 每次添加新彩蛋时，在这里注册

const EASTER_EGGS = [
  {
    id: 'calc',
    name: '计算器',
    description: 'BMI 体脂 配速计算',
    file: 'calc.js',
    icon: '🧮'
  },
  {
    id: 'calendar',
    name: '日历',
    description: 'Monthly Calendar',
    file: 'calendar.js',
    icon: '📅'
  },
  {
    id: 'clock',
    name: '番茄时钟',
    description: 'Pomodoro Timer',
    file: 'clock.js',
    icon: '🍅'
  },
  {
    id: 'countdown',
    name: '倒计时',
    description: 'Countdown Timer',
    file: 'countdown.js',
    icon: '⏱️'
  },
  {
    id: 'events',
    name: '每日事件',
    description: 'Daily Event List',
    file: 'events.js',
    icon: '📝'
  },

  // 示例彩蛋（取消注释以启用）
  // {
  //   id: 'example',
  //   name: '示例彩蛋',
  //   description: 'Example Easter Egg',
  //   file: 'example.js',
  //   icon: '🎁'
  // }
];

// 导出配置
if (typeof window !== 'undefined') {
  window.EASTER_EGGS = EASTER_EGGS;
}
