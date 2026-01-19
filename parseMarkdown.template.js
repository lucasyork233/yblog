// Markdown 解析器
function parseMarkdown(markdown) {
  // 统一换行符
  markdown = markdown.replace(/\r\n/g, '\n');
  
  const protectedBlocks = [];
  let blockIndex = 0;

  // 保护代码块
  markdown = markdown.replace(/```([\s\S]*?)```/g, (match) => {
    const placeholder = `___PROTECTED_BLOCK_${blockIndex}___`;
    protectedBlocks.push(match);
    blockIndex++;
    return placeholder;
  });

  // 保护表格
  const lines = markdown.split('\n');
  const tableLines = [];
  let inTable = false;
  let currentTable = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        currentTable = [line];
      } else {
        currentTable.push(line);
      }
    } else {
      if (inTable && currentTable.length >= 2) {
        const tableBlock = currentTable.join('\n');
        const placeholder = `___PROTECTED_BLOCK_${blockIndex}___`;
        protectedBlocks.push(tableBlock);
        tableLines.push({ index: i - currentTable.length, placeholder, length: currentTable.length });
        blockIndex++;
      }
      inTable = false;
      currentTable = [];
    }
  }
  
  if (inTable && currentTable.length >= 2) {
    const tableBlock = currentTable.join('\n');
    const placeholder = `___PROTECTED_BLOCK_${blockIndex}___`;
    protectedBlocks.push(tableBlock);
    tableLines.push({ index: lines.length - currentTable.length, placeholder, length: currentTable.length });
    blockIndex++;
  }
  
  for (let i = tableLines.length - 1; i >= 0; i--) {
    const { index, placeholder, length } = tableLines[i];
    lines.splice(index, length, placeholder);
  }
  
  markdown = lines.join('\n');

  // 块级元素解析
  let html = markdown
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^---$/gm, '<hr>');

  // 处理引用块（合并连续的引用行）
  const quoteLines = html.split('\n');
  const processedQuotes = [];
  let inQuote = false;
  let quoteContent = [];
  
  for (let i = 0; i < quoteLines.length; i++) {
    const line = quoteLines[i];
    const quoteMatch = line.match(/^> (.+)$/);
    
    if (quoteMatch) {
      if (!inQuote) {
        inQuote = true;
        quoteContent = [quoteMatch[1]];
      } else {
        quoteContent.push(quoteMatch[1]);
      }
    } else {
      if (inQuote) {
        processedQuotes.push(`<blockquote>${quoteContent.join('<br>')}</blockquote>`);
        inQuote = false;
        quoteContent = [];
      }
      processedQuotes.push(line);
    }
  }
  
  if (inQuote) {
    processedQuotes.push(`<blockquote>${quoteContent.join('<br>')}</blockquote>`);
  }
  
  html = processedQuotes.join('\n');

  // 处理列表
  const htmlLines = html.split('\n');
  const processedLines = [];
  let inList = false;
  let listStack = [];

  for (let i = 0; i < htmlLines.length; i++) {
    const line = htmlLines[i];
    const todoMatch = line.match(/^(\s*)- \[([ x])\] (.+)$/);
    const unorderedMatch = line.match(/^(\s*)[-*] (.+)$/);
    const orderedMatch = line.match(/^(\s*)(\d+)\. (.+)$/);
    
    if (todoMatch || unorderedMatch || orderedMatch) {
      const indent = (todoMatch || unorderedMatch || orderedMatch)[1].length;
      const isOrdered = !!orderedMatch;
      const isTodo = !!todoMatch;
      let content;
      if (isTodo) {
        const checked = todoMatch[2] === 'x';
        content = `<input type="checkbox" ${checked ? 'checked' : ''} disabled> ${todoMatch[3]}`;
      } else {
        content = isOrdered ? orderedMatch[3] : unorderedMatch[2];
      }
      if (!inList) {
        listStack = [{ indent, isOrdered }];
        processedLines.push(isOrdered ? '<ol>' : '<ul>');
        inList = true;
      } else {
        const currentList = listStack[listStack.length - 1];
        if (indent > currentList.indent) {
          listStack.push({ indent, isOrdered });
          processedLines.push(isOrdered ? '<ol>' : '<ul>');
        } else if (indent < currentList.indent) {
          while (listStack.length > 0 && listStack[listStack.length - 1].indent > indent) {
            const closingList = listStack.pop();
            processedLines.push(closingList.isOrdered ? '</ol>' : '</ul>');
            if (listStack.length > 0) processedLines.push('</li>');
          }
          processedLines.push('</li>');
        } else {
          processedLines.push('</li>');
        }
      }
      processedLines.push(`<li>${content}`);
    } else {
      if (inList) {
        processedLines.push('</li>');
        while (listStack.length > 0) {
          const closingList = listStack.pop();
          processedLines.push(closingList.isOrdered ? '</ol>' : '</ul>');
        }
        inList = false;
      }
      processedLines.push(line);
    }
  }
  
  if (inList) {
    processedLines.push('</li>');
    while (listStack.length > 0) {
      const closingList = listStack.pop();
      processedLines.push(closingList.isOrdered ? '</ol>' : '</ul>');
    }
  }
  
  html = processedLines.join('\n').replace(/\n\n/g, '</p><p>');

  // 行内元素解析（图片要在链接之前解析）
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // 恢复保护的块
  protectedBlocks.forEach((block, index) => {
    const placeholder = `___PROTECTED_BLOCK_${index}___`;
    
    if (block.startsWith('```')) {
      const match = block.match(/```(\w*)\n([\s\S]*?)\n```/);
      if (match) {
        const lang = match[1] || 'plaintext';
        const code = match[2]
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        html = html.replace(placeholder, `<pre><code class="language-${lang}">${code}</code></pre>`);
      }
    } else if (block.includes('|')) {
      const tableLines = block.trim().split('\n');
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split('|').filter(cell => cell.trim());
        const rows = tableLines.slice(2).map(line => line.split('|').filter(cell => cell.trim()));
        let tableHtml = '<table><thead><tr>';
        headers.forEach(header => { tableHtml += `<th>${header.trim()}</th>`; });
        tableHtml += '</tr></thead><tbody>';
        rows.forEach(row => {
          tableHtml += '<tr>';
          row.forEach(cell => { tableHtml += `<td>${cell.trim()}</td>`; });
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        html = html.replace(placeholder, tableHtml);
      }
    }
  });

  return `<p>${html}</p>`.replace(/<p><\/p>/g, '');
}
