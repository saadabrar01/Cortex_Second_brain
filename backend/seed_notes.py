"""
Seed Script for Cortex Second Brain
Populates the PostgreSQL database with a realistic batch of notes and tags.
Run: .venv\\Scripts\\python.exe seed_notes.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import AsyncSessionLocal, init_db
from schemas import NoteCreate
from services import create_note, get_notes_count, get_all_tags

SAMPLE_NOTES = [
    {
        "title": "Architecting Scalable FastAPI Services with AsyncPG",
        "content": (
            "# FastAPI & PostgreSQL Architecture\n\n"
            "Key patterns for building high-throughput APIs with FastAPI and async database drivers:\n\n"
            "1. **Connection Pooling**: Use `asyncpg` with SQLAlchemy 2.0 async engine (`pool_size=20`, `max_overflow=10`).\n"
            "2. **Dependency Injection**: Provide `AsyncSession` per request lifecycle with `Depends(get_db)`.\n"
            "3. **Pydantic V2 Serialization**: Leverage `model_config = ConfigDict(from_attributes=True)` for lightning-fast ORM transformations.\n\n"
            "```python\n"
            "from fastapi import Depends, FastAPI\n"
            "from sqlalchemy.ext.asyncio import AsyncSession\n\n"
            "@app.get('/api/notes')\n"
            "async def list_notes(db: AsyncSession = Depends(get_db)):\n"
            "    return await get_notes(db)\n"
            "```\n\n"
            "Related topics: #fastapi #database #architecture #python"
        ),
        "tags": ["fastapi", "database", "architecture", "python"]
    },
    {
        "title": "Modern React 19 Server Components & State Synchronization",
        "content": (
            "# React Server Components & Streaming UI\n\n"
            "React 19 introduces unified action patterns and enhanced concurrent rendering:\n\n"
            "- **Async Transitions**: Use `useTransition` to keep responsive navigation while background fetches resolve.\n"
            "- **Optimistic Updates**: Use `useOptimistic` for instant feedback when capturing or editing notes.\n"
            "- **Shared State**: Avoid unnecessary Redux boilerplate; lean on server state + URL search params for deep linking.\n\n"
            "```jsx\n"
            "const [isPending, startTransition] = useTransition();\n"
            "const [optimisticNotes, setOptimisticNotes] = useOptimistic(notes);\n"
            "```\n\n"
            "Explore further: #react #typescript #nextjs #frontend"
        ),
        "tags": ["react", "typescript", "nextjs", "frontend"]
    },
    {
        "title": "Model Context Protocol (MCP) Integration Patterns",
        "content": (
            "# Model Context Protocol (MCP) Deep Dive\n\n"
            "Anthropic's Model Context Protocol standardizes how LLMs interact with local and remote data stores.\n\n"
            "### Architecture Overview\n"
            "- **Host Application**: Claude Desktop, IDE extensions, or agent runtime.\n"
            "- **Client-Server Transport**: Stdio transport with JSON-RPC 2.0 messages over standard input/output.\n"
            "- **Tools & Resources**: Expose database queries (`search_notes`, `get_all_notes`) as discoverable tools.\n\n"
            "Key learnings: Always ensure `PYTHONUNBUFFERED=1` and proper `PYTHONPATH` so stdio pipes are not stalled by buffer latency.\n\n"
            "Tags: #mcp #ai #architecture #fastapi"
        ),
        "tags": ["mcp", "ai", "architecture", "fastapi"]
    },
    {
        "title": "PostgreSQL Indexing & Full-Text Search Optimization",
        "content": (
            "# Advanced Postgres Indexing & Search\n\n"
            "When scaling note retrieval in second brain knowledge graphs:\n\n"
            "1. **B-Tree on Foreign Keys**: Index `note_tags(note_id)` and `note_tags(tag_id)` to ensure fast joins.\n"
            "2. **Trigram Indexing (`pg_trgm`)**: Enable `gin_trgm_ops` for fast fuzzy string matching on note titles and content.\n"
            "3. **Composite Ordering**: Index `(updated_at DESC)` for instantaneous chronological paging.\n\n"
            "```sql\n"
            "CREATE EXTENSION IF NOT EXISTS pg_trgm;\n"
            "CREATE INDEX idx_notes_title_trgm ON notes USING gin (title gin_trgm_ops);\n"
            "```\n\n"
            "References: #database #architecture #performance"
        ),
        "tags": ["database", "architecture", "performance"]
    },
    {
        "title": "TypeScript Type-Safety Strategies for Fullstack Apps",
        "content": (
            "# End-to-End TypeScript Validation\n\n"
            "Achieving bulletproof type synchronization between FastAPI backends and Next.js frontends:\n\n"
            "- **Contract Generation**: Generate TypeScript interfaces from OpenAPI schemas with `openapi-typescript`.\n"
            "- **Defensive Normalization**: Always handle snake_case backend fields (`created_at`) alongside camelCase UI contracts.\n"
            "- **Discriminated Unions**: Model API states explicitly (`{ status: 'loading' } | { status: 'success', data: Note[] }`).\n\n"
            "Key tags: #typescript #react #frontend #architecture"
        ),
        "tags": ["typescript", "react", "frontend", "architecture"]
    },
    {
        "title": "Retrieval-Augmented Generation (RAG) with Local Context",
        "content": (
            "# Local RAG Engine for Second Brains\n\n"
            "Building a personalized AI assistant that reasons over private notes:\n\n"
            "1. **Hybrid Retrieval**: Combine lexical keyword search with dense vector similarity embeddings.\n"
            "2. **Context Window Curation**: Rank and deduplicate note chunks before assembling system prompts.\n"
            "3. **Citation Tracking**: Always pass source note IDs and titles back to the UI so users can verify references.\n\n"
            "Related: #ai #mcp #database"
        ),
        "tags": ["ai", "mcp", "database"]
    },
    {
        "title": "Next.js App Router & Glassmorphic Dashboard Design",
        "content": (
            "# Next.js Modern UI & Glassmorphism\n\n"
            "Best practices for building a responsive, visually stunning second-brain dashboard:\n\n"
            "- **Backdrop Filters**: Use `backdrop-blur-md` with subtle white opacity borders for depth.\n"
            "- **URL-Driven State**: Store search queries (`?q=...`) and active tag filters (`?tag=...`) in URL search params.\n"
            "- **Micro-Animations**: Add subtle hover glow effects with radial gradients and SVG neural networks.\n\n"
            "Tags: #nextjs #react #frontend"
        ),
        "tags": ["nextjs", "react", "frontend"]
    },
    {
        "title": "Distributed Systems: Eventual Consistency & Caching",
        "content": (
            "# Eventual Consistency in Distributed Knowledge Bases\n\n"
            "Notes on maintaining data consistency across offline clients and centralized databases:\n\n"
            "- **CRDTs (Conflict-free Replicated Data Types)**: Useful for real-time concurrent note editing.\n"
            "- **Cache Invalidation**: Cache tag aggregation counts with Redis or in-memory LRU with TTL.\n"
            "- **Idempotent APIs**: Ensure `PUT` and `POST` mutations can be safely retried over unstable networks.\n\n"
            "Tags: #architecture #database #performance"
        ),
        "tags": ["architecture", "database", "performance"]
    }
]

async def seed():
    print("Initializing database...")
    await init_db()

    async with AsyncSessionLocal() as db:
        print(f"Inserting {len(SAMPLE_NOTES)} sample notes...")
        for data in SAMPLE_NOTES:
            note_create = NoteCreate(
                title=data["title"],
                content=data["content"],
                tags=data["tags"]
            )
            created = await create_note(db, note_create)
            print(f"  + Created: '{created.title}' (tags: {data['tags']})")

        total_notes = await get_notes_count(db)
        all_tags = await get_all_tags(db)
        
        print("\n" + "=" * 50)
        print(f"SEEDING COMPLETE! Total notes in DB: {total_notes}")
        print("Tags summary:")
        for t in all_tags:
            print(f"  #{t['name']}: {t['count']} notes")
        print("=" * 50)

if __name__ == "__main__":
    asyncio.run(seed())
