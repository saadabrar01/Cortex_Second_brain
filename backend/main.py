from contextlib import asynccontextmanager
from typing import Optional
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import AsyncSessionLocal, close_db, get_db, init_db
from models import Note, Tag, NoteTag
from schemas import (
    ChatRequest,
    ChatResponse,
    HealthResponse,
    NoteCreate,
    NoteResponse,
    NoteUpdate,
    SearchResponse,
    SearchResult,
    TagResponse,
)
from services import (
    create_note,
    delete_note,
    get_all_tags,
    get_note,
    get_notes,
    get_notes_by_tag,
    get_notes_count,
    get_note_tags,
    get_related_notes,
    get_suggestions,
    search_notes,
    update_note,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Second Brain API",
    description="API for Personal Second Brain Dashboard with PostgreSQL",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/notes", response_model=list[NoteResponse])
async def list_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tag: Optional[str] = Query(None, description="Filter notes by tag name"),
    query: Optional[str] = Query(None, description="Search query for title/content"),
    db: AsyncSession = Depends(get_db),
):
    if tag:
        notes = await get_notes_by_tag(db, tag)
    elif query:
        notes = await search_notes(db, query)
    else:
        notes = await get_notes(db, skip, limit)
    
    result = []
    for note in notes:
        tags = await get_note_tags(db, note.id)
        result.append(NoteResponse(
            id=note.id,
            title=note.title,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
            tags=tags,
        ))
    return result


@app.post("/api/notes", response_model=NoteResponse, status_code=201)
async def create_note_endpoint(
    note: NoteCreate,
    db: AsyncSession = Depends(get_db),
):
    db_note = await create_note(db, note)
    tags = await get_note_tags(db, db_note.id)
    return NoteResponse(
        id=db_note.id,
        title=db_note.title,
        content=db_note.content,
        created_at=db_note.created_at,
        updated_at=db_note.updated_at,
        tags=tags,
    )


@app.get("/api/notes/{note_id}", response_model=NoteResponse)
async def get_note_endpoint(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    note = await get_note(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    tags = await get_note_tags(db, note_id)
    return NoteResponse(
        id=note.id,
        title=note.title,
        content=note.content,
        created_at=note.created_at,
        updated_at=note.updated_at,
        tags=tags,
    )


@app.put("/api/notes/{note_id}", response_model=NoteResponse)
async def update_note_endpoint(
    note_id: UUID,
    note: NoteUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated = await update_note(db, note_id, note)
    if not updated:
        raise HTTPException(status_code=404, detail="Note not found")
    tags = await get_note_tags(db, note_id)
    return NoteResponse(
        id=updated.id,
        title=updated.title,
        content=updated.content,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
        tags=tags,
    )


@app.delete("/api/notes/{note_id}", status_code=204)
async def delete_note_endpoint(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    deleted = await delete_note(db, note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")


@app.get("/api/search", response_model=SearchResponse)
async def search_endpoint(
    q: str = Query(..., min_length=1, description="Search query"),
    db: AsyncSession = Depends(get_db),
):
    results = await search_notes(db, q)
    suggestions = await get_suggestions(db, q)

    search_results = [
        SearchResult(
            id=note.id,
            title=note.title,
            content=note.content[:300] + ("..." if len(note.content) > 300 else ""),
            match_type="title" if q.lower() in note.title.lower() else "content",
        )
        for note in results
    ]

    return SearchResponse(results=search_results, suggestions=suggestions)


@app.get("/api/tags", response_model=list[TagResponse])
async def list_tags(db: AsyncSession = Depends(get_db)):
    tags = await get_all_tags(db)
    return [TagResponse(id=UUID(int=0), name=t["name"], count=t["count"]) for t in tags]


@app.get("/api/tags/{tag_name}/notes", response_model=list[NoteResponse])
async def notes_by_tag(
    tag_name: str,
    db: AsyncSession = Depends(get_db),
):
    notes = await get_notes_by_tag(db, tag_name)
    result = []
    for note in notes:
        tags = await get_note_tags(db, note.id)
        result.append(NoteResponse(
            id=note.id,
            title=note.title,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
            tags=tags,
        ))
    return result


@app.get("/api/notes/{note_id}/related", response_model=list[NoteResponse])
async def related_notes(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    note = await get_note(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    related = await get_related_notes(db, note_id)
    result = []
    for r_note in related:
        tags = await get_note_tags(db, r_note.id)
        result.append(NoteResponse(
            id=r_note.id,
            title=r_note.title,
            content=r_note.content,
            created_at=r_note.created_at,
            updated_at=r_note.updated_at,
            tags=tags,
        ))
    return result


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    results = await search_notes(db, request.query)

    if not results:
        return ChatResponse(
            answer="I couldn't find any relevant notes for your question. Try adding some notes first or rephrasing your query.",
            sources=[],
        )

    context_parts = []
    sources = []
    for note in results[:3]:
        context_parts.append(f"**{note.title}**:\n{note.content}")
        sources.append({
            "id": str(note.id),
            "title": note.title,
            "match_type": "title" if request.query.lower() in note.title.lower() else "content",
        })

    context = "\n\n---\n\n".join(context_parts)
    answer = f"Based on your notes, here's what I found:\n\n{context}"

    return ChatResponse(answer=answer, sources=sources)


@app.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        count = await get_notes_count(db)
        return HealthResponse(status="ok", notes_count=count, db_connected=True)
    except Exception:
        return HealthResponse(status="error", notes_count=0, db_connected=False)