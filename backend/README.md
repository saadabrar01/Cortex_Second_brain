# Second Brain FastAPI Backend (PostgreSQL)

A FastAPI backend for the Personal Second Brain Dashboard using PostgreSQL for persistent storage.

## Features

- **PostgreSQL storage**: Notes, tags, and relationships stored in database
- **Async SQLAlchemy 2.0**: Modern async ORM with connection pooling
- **Full-text search**: Search notes by title and content
- **Tag system**: Automatic tag extraction from `#hashtags` in content
- **RESTful API**: Full CRUD for notes, search, tags, and AI chat
- **CORS enabled**: Configured for Next.js frontend at `localhost:3000`
- **Auto-reload**: Development mode with hot reload

## Quick Start

### Prerequisites

- PostgreSQL 14+ running locally or remotely
- Database `seconed_brain` created
- Python 3.11+

### Windows (PowerShell)
```powershell
cd backend
.\run.ps1
```

### Manual (any OS)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .\.venv\Scripts\Activate.ps1  # Windows PowerShell

pip install -r requirements.txt

# Configure .env with your database URL
# DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Database Setup

```sql
-- Create database
CREATE DATABASE seconed_brain;

-- Or use existing database and tables will be auto-created on startup
```

Tables are created automatically on first run via SQLAlchemy.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List all notes (paginated) |
| POST | `/api/notes` | Create new note |
| GET | `/api/notes/{id}` | Get single note |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |
| GET | `/api/search?q=...` | Search notes + suggestions |
| GET | `/api/tags` | List all tags with counts |
| GET | `/api/tags/{tag}/notes` | Notes filtered by tag |
| GET | `/api/notes/{id}/related` | Related notes by shared tags |
| POST | `/api/chat` | AI chat with note context |
| GET | `/health` | Health check (includes DB status) |

## API Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Note Format

Notes support markdown with inline tags:

```markdown
# My Note Title

This is the note content with **markdown** support.

#tag1 #tag2 #project-alpha
```

Tags are automatically extracted from `#hashtag` patterns in content.

## Configuration

Environment variables in `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgresql@6376@localhost:5432/seconed_brain
HOST=0.0.0.0
PORT=8000
RELOAD=true
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

## Frontend Integration

The Next.js frontend expects the backend at `http://localhost:8000/api`. Configure in frontend `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_USE_MOCK_FALLBACK=false
```

## Project Structure

```
backend/
├── main.py              # FastAPI application & routes
├── config.py            # Settings management (pydantic-settings)
├── database.py          # SQLAlchemy engine & session
├── models.py            # SQLAlchemy ORM models
├── schemas.py           # Pydantic request/response models
├── services.py          # Business logic / CRUD operations
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment variables template
├── run.ps1              # Windows startup script
└── README.md
```

## Database Schema

```
notes
├── id (UUID, PK)
├── title (VARCHAR 200)
├── content (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

tags
├── id (UUID, PK)
└── name (VARCHAR 50, UNIQUE)

note_tags (junction)
├── note_id (UUID, FK)
├── tag_id (UUID, FK)
└── created_at (TIMESTAMPTZ)
```

## Migration from File-based

If migrating from the file-based version, you can import existing `.md` files:

```python
# Run once to import existing notes
import asyncio
from pathlib import Path
from database import AsyncSessionLocal
from services import create_note
from schemas import NoteCreate

async def import_notes():
    notes_dir = Path("../notes")  # old notes location
    async with AsyncSessionLocal() as db:
        for md_file in notes_dir.glob("*.md"):
            content = md_file.read_text(encoding="utf-8")
            lines = content.split("\n", 1)
            title = lines[0].lstrip("# ").strip() if lines[0].startswith("#") else md_file.stem
            body = lines[1].strip() if len(lines) > 1 else ""
            await create_note(db, NoteCreate(title=title, content=body))

asyncio.run(import_notes())
```