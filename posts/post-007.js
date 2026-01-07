window.post007 = {
  slug: 'post-007',
  title: 'Markdown解析 - 测试',
  date: '2026-01-06',
  summary: '测试当前Markdown解析器的所有功能',
  tags: ['markdown', 'test'],
  content: `## 混合内容测试

### 标题 + 列表 + 代码

#### 功能列表

- **解析器架构**：分层处理
  - 第一层：保护复杂块元素
  - 第二层：块级元素解析
  - 第三层：行内元素解析
- **支持语法**：
  1. 标题（1-6级）
  2. 列表（有序/无序）
  3. 表格
  4. 代码块

#### 示例代码

\`\`\`javascript
// 解析器核心逻辑
function parseMarkdown(markdown) {
  // 1. 保护复杂元素
  // 2. 解析块级元素
  // 3. 解析行内元素
  // 4. 重构HTML
  return html;
}
\`\`\`

---

## 边缘情况测试

### 空行处理

段落1

段落2（中间有空行）

段落3
`
};
