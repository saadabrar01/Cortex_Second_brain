// Minimal, dependency-free markdown renderer covering the subset used by
// notes in this app: headings, bold/italic, inline code, code fences,
// blockquotes, links, and ordered/unordered lists.
// Swap this for `react-markdown` + `remark-gfm` if richer syntax is needed.

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inline(text) {
  let out = escapeHtml(text)
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
  out = out.replace(/^- \[ \] (.*)$/gm, '<span style="opacity:.6">&#9744;</span> $1')
  out = out.replace(/^- \[x\] (.*)$/gim, '<span>&#9745;</span> $1')
  return out
}

export function renderMarkdown(src = '') {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const html = []
  let i = 0
  let inCodeBlock = false
  let codeBuffer = []
  let listBuffer = []
  let listType = null

  const flushList = () => {
    if (listBuffer.length) {
      const tag = listType === 'ol' ? 'ol' : 'ul'
      html.push(`<${tag}>${listBuffer.map((li) => `<li>${inline(li)}</li>`).join('')}</${tag}>`)
      listBuffer = []
      listType = null
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        flushList()
        inCodeBlock = true
        codeBuffer = []
      } else {
        html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`)
        inCodeBlock = false
      }
      i++
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      i++
      continue
    }

    if (/^#{1,3}\s/.test(line)) {
      flushList()
      const level = line.match(/^#+/)[0].length
      const text = line.replace(/^#{1,3}\s/, '')
      html.push(`<h${level}>${inline(text)}</h${level}>`)
      i++
      continue
    }

    if (/^>\s?/.test(line)) {
      flushList()
      html.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`)
      i++
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      if (listType && listType !== 'ul') flushList()
      listType = 'ul'
      listBuffer.push(line.replace(/^\s*[-*]\s+/, ''))
      i++
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      if (listType && listType !== 'ol') flushList()
      listType = 'ol'
      listBuffer.push(line.replace(/^\s*\d+\.\s+/, ''))
      i++
      continue
    }

    flushList()

    if (line.trim() === '') {
      i++
      continue
    }

    html.push(`<p>${inline(line)}</p>`)
    i++
  }

  flushList()
  if (inCodeBlock && codeBuffer.length) {
    html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`)
  }

  return html.join('\n')
}
