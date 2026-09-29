// Local fixture data. The services layer reaches for this only when the
// FastAPI backend can't be reached, so the dashboard is demoable standalone.

export const MOCK_TAGS = [
  { name: 'react', count: 8 },
  { name: 'architecture', count: 5 },
  { name: 'career', count: 3 },
  { name: 'databases', count: 6 },
  { name: 'reading-list', count: 4 },
  { name: 'ai-ml', count: 7 },
  { name: 'writing', count: 2 },
  { name: 'infra', count: 5 },
]

export const MOCK_NOTES = [
  {
    id: 'n1',
    title: 'Why React Server Components change data fetching',
    excerpt:
      'RSCs move the fetch waterfall onto the server, which removes most of the client-side loading spinners we used to design around.',
    tags: ['react', 'architecture'],
    updatedAt: '2026-09-24T10:12:00Z',
    content:
      '# Why React Server Components change data fetching\n\nServer components let a tree render on the server and stream down already-resolved data. No client-side `useEffect` fetch, no waterfall.\n\n## Key ideas\n- Data fetching moves next to the component that needs it\n- Client bundle shrinks because server components never ship JS\n- Interactivity still needs a client boundary (`"use client"`)\n\n> The mental model shifts from "fetch, then render" to "render, and fetching happens where it is needed."\n\n```jsx\nasync function Note({ id }) {\n  const note = await getNote(id)\n  return <Article data={note} />\n}\n```\n',
  },
  {
    id: 'n2',
    title: 'Notes on event-driven architecture tradeoffs',
    excerpt:
      'Event-driven systems buy you loose coupling but the cost shows up later as debugging difficulty and eventual consistency.',
    tags: ['architecture', 'infra'],
    updatedAt: '2026-09-22T15:40:00Z',
    content:
      '# Event-driven architecture tradeoffs\n\nEvents decouple producers from consumers, but tracing a request across five queues at 2am is a real cost.\n\n## When it pays off\n1. Multiple independent consumers of the same fact\n2. Bursty load that needs buffering\n3. Long-running workflows\n\n## When it does not\n- Simple request/response CRUD\n- Small teams without strong observability',
  },
  {
    id: 'n3',
    title: 'Career notes: switching from IC to tech lead',
    excerpt:
      'The job stops being about your own output and starts being about the throughput of the people around you.',
    tags: ['career'],
    updatedAt: '2026-09-20T09:05:00Z',
    content:
      '# Switching from IC to tech lead\n\nThe hardest adjustment: your calendar becomes the product. Protect deep-work blocks for the team, not just yourself.\n\n- Delegate the interesting problems, not just the boring ones\n- Write things down so decisions survive without you in the room\n- Ask "what would unblock you" instead of assigning tasks',
  },
  {
    id: 'n4',
    title: 'Indexing strategies for Postgres at scale',
    excerpt:
      'A composite index only helps if the query planner can use its leftmost columns — order the columns by selectivity.',
    tags: ['databases'],
    updatedAt: '2026-09-18T18:22:00Z',
    content:
      '# Indexing strategies for Postgres\n\nA composite index `(a, b, c)` is usable for filters on `a`, `(a,b)` or `(a,b,c)` — not on `b` alone.\n\n```sql\nCREATE INDEX idx_notes_tag_updated\nON notes (tag, updated_at DESC);\n```\n\nWatch `EXPLAIN ANALYZE` for sequential scans creeping back in after a migration.',
  },
  {
    id: 'n5',
    title: 'Reading list: systems papers worth a second pass',
    excerpt:
      'Dynamo, Raft, and the original MapReduce paper still explain most of the vocabulary used in modern infra docs.',
    tags: ['reading-list', 'infra'],
    updatedAt: '2026-09-15T12:00:00Z',
    content:
      '# Systems papers worth a second pass\n\n- *Dynamo* — eventual consistency, vector clocks\n- *Raft* — consensus, readable by design\n- *MapReduce* — batch processing at scale\n\nRevisit these before any distributed-systems interview loop.',
  },
  {
    id: 'n6',
    title: 'What retrieval-augmented generation actually retrieves',
    excerpt:
      'RAG quality is a search-relevance problem wearing an AI costume — the embedding model matters less than the chunking strategy.',
    tags: ['ai-ml'],
    updatedAt: '2026-09-12T08:30:00Z',
    content:
      '# What RAG actually retrieves\n\nMost RAG failures trace back to chunking, not the model. Chunk by semantic section, not fixed token count, and keep a title/heading in every chunk for context.\n\n## Checklist\n- [ ] Chunks carry their section heading\n- [ ] Overlap between chunks to avoid boundary loss\n- [ ] Rerank before feeding the top-k to the model',
  },
]

export function mockSearchNotes(query) {
  const q = query.trim().toLowerCase()
  if (!q) return MOCK_NOTES
  return MOCK_NOTES.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q) ||
      n.tags.some((t) => t.includes(q)),
  )
}

export function mockRelatedNotes(noteId, limit = 3) {
  const current = MOCK_NOTES.find((n) => n.id === noteId)
  if (!current) return MOCK_NOTES.slice(0, limit)
  return MOCK_NOTES.filter(
    (n) => n.id !== noteId && n.tags.some((t) => current.tags.includes(t)),
  ).slice(0, limit)
}

export function mockChatResponse(query) {
  const matches = mockSearchNotes(query).slice(0, 3)
  const answer = matches.length
    ? `Based on your notes, here's a synthesis for "${query}": ${matches
        .map((m) => m.excerpt)
        .join(' ')}`
    : `I couldn't find notes closely related to "${query}" yet. Try rephrasing, or add a note on this topic first.`
  return {
    answer,
    sources: matches.map((m) => ({ id: m.id, title: m.title })),
  }
}
