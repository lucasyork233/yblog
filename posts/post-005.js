window.post005 = {
  slug: 'post-005',
  title: 'Markdown解析 - 代码块',
  date: '2026-01-06',
  summary: '完善代码块的解析',
  tags: ['markdown', 'test'],
  content: `## JavaScript代码

\`\`\`javascript
// 函数定义
function calculate(a, b) {
  const result = a + b;
  return result;
}

// 变量声明
const name = "World";
let count = 10;
var flag = true;

// 控制流
if (count > 5) {
  console.log("大于5");
} else {
  console.log("小于等于5");
}

// 循环
for (let i = 0; i < count; i++) {
  calculate(i, 1);
}
\`\`\`

## CSS代码

\`\`\`css
.container {
  background: #f9fafb;
  color: #1f2937;
  padding: 2rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.button {
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background: #dc2626;
}
\`\`\`
`
};
