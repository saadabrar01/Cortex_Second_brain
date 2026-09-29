from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(default="")
    excerpt: Optional[str] = Field(default=None, max_length=500)
    tags: Optional[list[str]] = Field(default=None)


class NoteCreate(NoteBase):
    pass


class NoteUpdate(NoteBase):
    pass


class NoteResponse(NoteBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    tags: list[str] = []
    excerpt: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TagResponse(BaseModel):
    id: UUID
    name: str
    count: int = 0

    model_config = ConfigDict(from_attributes=True)


class SearchResult(BaseModel):
    id: UUID
    title: str
    content: str
    match_type: str


class SearchResponse(BaseModel):
    results: list[SearchResult]
    suggestions: list[str]


class ChatRequest(BaseModel):
    query: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]


class HealthResponse(BaseModel):
    status: str
    notes_count: int
    db_connected: bool