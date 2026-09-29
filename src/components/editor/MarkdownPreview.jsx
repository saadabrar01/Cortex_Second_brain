import { renderMarkdown } from '../../utils/markdown'

export default function MarkdownPreview({ content }) {
  return (
    <div
      className="md-preview h-full overflow-y-auto px-1"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
