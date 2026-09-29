import NoteEditor from '../../../components/editor/NoteEditor.jsx'

export default async function EditNotePage({ params }) {
  const { id } = await params
  return <NoteEditor noteId={id} />
}
