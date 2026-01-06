// 文章配置文件
// 这里列出所有需要加载的文章文件
// 每次添加新文章时，在这里添加对应的文件名

const POST_FILES = [
  // 添加新文章时格式
  // 'post-xxx.js',
  
  'post-001.js',
  'post-002.js',
  'post-003.js',
  'post-004.js',
  'post-005.js',
  'post-006.js',
  'post-007.js',
];

// 导出配置
if (typeof window !== 'undefined') {
  window.POST_FILES = POST_FILES;
}
