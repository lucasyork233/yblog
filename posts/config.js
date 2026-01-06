// 文章配置文件
// 这里列出所有需要加载的文章文件
// 每次添加新文章时，在这里添加对应的文件名

const POST_FILES = [
  'post-01.js',
  'post-02.js',
  // 添加新文章时，按照格式添加：
  'post-03.js',
  // 'post-04.js',
];

// 导出配置
if (typeof window !== 'undefined') {
  window.POST_FILES = POST_FILES;
}
