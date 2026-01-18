// 彩蛋管理器
const EasterEggManager = {
  eggs: [],
  loaded: false,

  // 初始化 - 加载所有彩蛋
  async init() {
    if (this.loaded) return;
    
    // 加载配置文件
    await this.loadConfig();
    
    // 加载所有彩蛋文件
    await this.loadEggs();
    
    this.loaded = true;
  },

  // 加载配置文件
  loadConfig() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'easter-eggs/config.js';
      script.onload = () => {
        if (window.EASTER_EGGS) {
          this.eggs = window.EASTER_EGGS;
        }
        resolve();
      };
      script.onerror = () => {
        console.warn('Failed to load easter eggs config');
        resolve();
      };
      document.head.appendChild(script);
    });
  },

  // 加载所有彩蛋文件
  async loadEggs() {
    const loadPromises = this.eggs.map(egg => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `easter-eggs/${egg.file}`;
        script.onload = () => resolve();
        script.onerror = () => {
          console.warn(`Failed to load easter egg: ${egg.file}`);
          resolve();
        };
        document.head.appendChild(script);
      });
    });

    await Promise.all(loadPromises);
  },

  // 根据 ID 获取彩蛋
  getEgg(id) {
    return this.eggs.find(egg => egg.id === id);
  },

  // 检查是否存在某个彩蛋
  hasEgg(id) {
    return this.eggs.some(egg => egg.id === id);
  },

  // 渲染彩蛋
  renderEgg(id, app, navigate) {
    const egg = this.getEgg(id);
    if (!egg) {
      console.warn(`Easter egg not found: ${id}`);
      return false;
    }

    // 根据 ID 调用对应的渲染器
    const rendererName = this.getRendererName(id);
    const renderer = window[rendererName];
    
    if (renderer && typeof renderer.render === 'function') {
      renderer.render(app, navigate);
      return true;
    } else {
      console.warn(`Renderer not found for easter egg: ${id}`);
      return false;
    }
  },

  // 获取渲染器名称（驼峰命名）
  getRendererName(id) {
    // 将 ID 转换为驼峰命名 + EasterEgg 后缀
    // 例如: clock -> ClockEasterEgg, my-egg -> MyEggEasterEgg
    const camelCase = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    return `${pascalCase}EasterEgg`;
  },

  // 获取所有彩蛋列表（用于生成提示信息）
  getAllEggs() {
    return this.eggs.map(egg => ({
      id: egg.id,
      name: egg.name,
      description: egg.description,
      icon: egg.icon
    }));
  },

  // 生成彩蛋提示 HTML（用于 HTML 注释）
  generateHintHTML() {
    if (this.eggs.length === 0) return '';
    
    const hints = this.eggs.map(egg => 
      `    ║  ${egg.icon} #${egg.id.padEnd(8)} - ${egg.description.padEnd(30)} ║`
    ).join('\n');

    return `
    ╔══════════════════════════════════════════════════════════════╗
    ║  🎉 Congrats! You found the secret easter egg! 🎉           ║
    ║                                                              ║
    ║  Hidden pages:                                               ║
${hints}
    ║                                                              ║
    ║  Stay focused, stay organized.                               ║
    ╚══════════════════════════════════════════════════════════════╝`;
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.EasterEggManager = EasterEggManager;
}
