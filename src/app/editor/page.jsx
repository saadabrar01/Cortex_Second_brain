import NoteEditor from '../../components/editor/NoteEditor.jsx'

export const metadata = { title: 'New note — Cortex' }

// No [id] segment here — this is the "compose a new note" route.
// Once saved, NoteEditor redirects to /editor/[id] for the created note.
export default function NewNotePage() {
  return <NoteEditor noteId={null} />
}
