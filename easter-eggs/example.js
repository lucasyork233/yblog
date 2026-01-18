// 示例彩蛋 - 展示如何创建新彩蛋
// 这个文件可以作为创建新彩蛋的模板

const ExampleEasterEgg = {
  // 渲染页面 - 必须实现此方法
  render(app, navigate) {
    app.innerHTML = `
      <div class="page">
        <div class="card" style="max-width: 600px; margin: 0 auto;">
          <h1 style="text-align: center; color: var(--accent); margin-bottom: 2rem;">
            🎁 示例彩蛋
          </h1>
          
          <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">这是一个示例彩蛋</h2>
            <p style="color: var(--text-secondary); line-height: 1.6;">
              你可以复制这个文件作为模板，创建自己的彩蛋。
            </p>
          </div>

          <div style="background: var(--bg-subtle); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem;">
            <h3 style="font-size: 1rem; margin-bottom: 1rem;">功能演示</h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <button id="countBtn" class="btn btn-start">点击计数: 0</button>
              <button id="alertBtn" class="btn btn-stop">显示提示</button>
              <button id="saveBtn" class="btn btn-reset">保存数据</button>
            </div>
          </div>

          <div style="text-align: center;">
            <button id="backBtn" class="back-link" style="display: inline-block;">
              返回首页
            </button>
          </div>
        </div>
      </div>
    `;

    // 绑定事件
    this.bindEvents(navigate);
    
    // 加载保存的数据
    this.loadData();
  },

  // 绑定事件监听
  bindEvents(navigate) {
    let count = 0;
    
    // 计数按钮
    const countBtn = document.getElementById('countBtn');
    countBtn.addEventListener('click', () => {
      count++;
      countBtn.textContent = `点击计数: ${count}`;
    });

    // 提示按钮
    document.getElementById('alertBtn').addEventListener('click', () => {
      alert('这是一个示例提示！\n\n你可以在这里添加任何功能。');
    });

    // 保存按钮
    document.getElementById('saveBtn').addEventListener('click', () => {
      const data = {
        count: count,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('exampleEggData', JSON.stringify(data));
      alert('数据已保存！');
    });

    // 返回按钮
    document.getElementById('backBtn').addEventListener('click', (e) => {
      e.preventDefault();
      navigate('#home');
    });
  },

  // 加载保存的数据
  loadData() {
    const saved = localStorage.getItem('exampleEggData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        console.log('加载的数据:', data);
      } catch (e) {
        console.error('数据加载失败:', e);
      }
    }
  }
};

// 注册到全局 - 必须添加此代码
if (typeof window !== 'undefined') {
  window.ExampleEasterEgg = ExampleEasterEgg;
}
