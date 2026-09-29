'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Code,
  Link2,
  Eye,
  PenLine,
  X,
  Check,
} from 'lucide-react'
import MarkdownPreview from './MarkdownPreview.jsx'
import RelatedNotesSidebar from './RelatedNotesSidebar.jsx'
import { notesService } from '../../services/notesService'

const TOOLBAR = [
  { icon: Bold, wrap: ['**', '**'], label: 'Bold' },
  { icon: Italic, wrap: ['*', '*'], label: 'Italic' },
  { icon: Heading2, wrap: ['## ', ''], label: 'Heading', linePrefix: true },
  { icon: List, wrap: ['- ', ''], label: 'List', linePrefix: true },
  { icon: Quote, wrap: ['> ', ''], label: 'Quote', linePrefix: true },
  { icon: Code, wrap: ['`', '`'], label: 'Inline code' },
  { icon: Link2, wrap: ['[', '](url)'], label: 'Link' },
]

export default function NoteEditor({ noteId }) {
  const router = useRouter()
  const textareaRef = useRef(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState([])
  const [tagDraft, setTagDraft] = useState('')
  const [mobileTab, setMobileTab] = useState('write')
  const [status, setStatus] = useState('idle') // idle | saving | saved
  const [loading, setLoading] = useState(!!noteId)

  useEffect(() => {
    if (!noteId) {
      setTitle('')
      setContent('# Untitled note\n\nStart writing…')
      setTags([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    notesService.get(noteId).then((note) => {
      if (cancelled || !note) return
      setTitle(note.title)
      setContent(note.content)
      setTags(note.tags || [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [noteId])

  const applyWrap = ({ wrap, linePrefix }) => {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart, selectionEnd, value } = el
    const selected = value.slice(selectionStart, selectionEnd)

    let next
    let cursorPos
    if (linePrefix) {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
      next = value.slice(0, lineStart) + wrap[0] + value.slice(lineStart)
      cursorPos = selectionStart + wrap[0].length
    } else {
      next = value.slice(0, selectionStart) + wrap[0] + selected + wrap[1] + value.slice(selectionEnd)
      cursorPos = selectionEnd + wrap[0].length
    }

    setContent(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursorPos, cursorPos)
    })
  }

  const addTag = (e) => {
    e.preventDefault()
    const clean = tagDraft.trim().toLowerCase().replace(/\s+/g, '-')
    if (clean && !tags.includes(clean)) setTags([...tags, clean])
    setTagDraft('')
  }

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag))

  const save = async () => {
    setStatus('saving')
    const excerpt = content.replace(/^#.*\n/, '').replace(/[#*`>-]/g, '').trim().slice(0, 140)
    const payload = { title: title || 'Untitled note', content, tags, excerpt }
    const saved = noteId ? await notesService.update(noteId, payload) : await notesService.create(payload)
    setStatus('saved')
    // A brand-new note gets its own permanent URL once it has an id.
    if (!noteId && saved?.id) router.push(`/editor/${saved.id}`)
    setTimeout(() => setStatus('idle'), 1800)
  }

  if (loading) {
    return <div className="glass h-[70vh] animate-pulse rounded-2xl" />
  }

  return (
    <div className="flex h-[calc(100vh-88px)] flex-col gap-4 sm:h-[calc(100vh-64px)] lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="glass flex flex-col gap-3 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled note"
              className="w-full bg-transparent font-display text-lg font-semibold text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              onClick={save}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet to-azure px-3.5 py-2 text-xs font-medium text-white shadow-glow-violet transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {status === 'saved' ? <Check size={14} /> : null}
              {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save note'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-ink-muted"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="text-ink-faint hover:text-ink">
                  <X size={10} />
                </button>
              </span>
            ))}
            <form onSubmit={addTag}>
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                placeholder="+ add tag"
                className="w-20 bg-transparent text-[11px] text-ink-muted placeholder:text-ink-faint focus:outline-none"
              />
            </form>
          </div>
        </div>

        {/* Mobile write/preview toggle */}
        <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 lg:hidden">
          {[
            { key: 'write', icon: PenLine, label: 'Write' },
            { key: 'preview', icon: Eye, label: 'Preview' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setMobileTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs ${
                mobileTab === key ? 'bg-violet/20 text-violet-soft' : 'text-ink-faint'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          <div
            className={`glass flex min-h-0 flex-col rounded-2xl p-3 ${
              mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="mb-2 flex gap-1 border-b border-white/[0.06] pb-2">
              {TOOLBAR.map(({ icon: Icon, label, ...action }) => (
                <button
                  key={label}
                  title={label}
                  onClick={() => applyWrap(action)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-0 flex-1 resize-none bg-transparent font-mono text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none"
              spellCheck={false}
            />
          </div>

          <div
            className={`glass min-h-0 rounded-2xl p-4 ${mobileTab === 'write' ? 'hidden lg:block' : 'block'}`}
          >
            <MarkdownPreview content={content} />
          </div>
        </div>
      </div>

      <div className="w-full shrink-0 lg:w-[280px]">
        <RelatedNotesSidebar noteId={noteId} />
      </div>
    </div>
  )
}
