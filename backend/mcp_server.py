r"""
MCP Server for Second Brain Dashboard - Production Ready (MCP 0.9.x compatible)
Exposes PostgreSQL database tools via Model Context Protocol (stdio transport)
Run: .venv\Scripts\python -m mcp_server
"""

import asyncio
import json
import os
import sys
from typing import Any, Dict, List
from uuid import UUID

# Add backend to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mcp import types
from mcp.server import Server
from mcp.server.stdio import stdio_server
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import AsyncSessionLocal, init_db
from models import Note, NoteTag, Tag
from schemas import NoteCreate
from services import create_note, get_note_tags


# Create MCP server instance
app = Server("second-brain-mcp")


@app.list_tools()
async def list_tools() -> List[types.Tool]:
    """List all available MCP tools."""
    return [
        types.Tool(
            name="get_notes_count",
            description="Get the total count of notes in the database",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": [],
            },
        ),
        types.Tool(
            name="get_all_notes",
            description="Retrieve all notes from the database with pagination",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "default": 50,
                        "minimum": 1,
                        "maximum": 100,
                        "description": "Maximum number of notes to return"
                    },
                    "offset": {
                        "type": "integer",
                        "default": 0,
                        "minimum": 0,
                        "description": "Number of notes to skip for pagination"
                    },
                },
                "required": [],
            },
        ),
        types.Tool(
            name="search_notes",
            description="Search notes by title and content using case-insensitive fuzzy matching",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "minLength": 1,
                        "description": "Search term to match against note titles and content"
                    },
                    "limit": {
                        "type": "integer",
                        "default": 20,
                        "minimum": 1,
                        "maximum": 50,
                        "description": "Maximum number of results to return"
                    },
                },
                "required": ["query"],
            },
        ),
        types.Tool(
            name="create_note",
            description="Create and save a new note directly to the Second Brain PostgreSQL database with title, content, and optional tags",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 200,
                        "description": "Title of the note (required)",
                    },
                    "content": {
                        "type": "string",
                        "description": "Markdown content/body of the note (required)",
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional list of tags for categorizing the note (e.g. ['ai', 'fastapi', 'architecture'])",
                    },
                },
                "required": ["title", "content"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[types.TextContent]:
    """Execute an MCP tool."""
    
    if name == "get_notes_count":
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(func.count(Note.id)))
            count = result.scalar_one()
            return [types.TextContent(type="text", text=str(count))]
    
    elif name == "get_all_notes":
        limit = min(max(arguments.get("limit", 50), 1), 100)
        offset = max(arguments.get("offset", 0), 0)
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Note)
                .order_by(Note.updated_at.desc())
                .offset(offset)
                .limit(limit)
            )
            notes = list(result.scalars().all())
            
            notes_with_tags = []
            for note in notes:
                tags_result = await db.execute(
                    select(Tag.name)
                    .join(NoteTag, Tag.id == NoteTag.tag_id)
                    .where(NoteTag.note_id == note.id)
                )
                tags = [row[0] for row in tags_result.all()]
                
                notes_with_tags.append({
                    "id": str(note.id),
                    "title": note.title,
                    "content": note.content,
                    "created_at": note.created_at.isoformat(),
                    "updated_at": note.updated_at.isoformat(),
                    "tags": tags,
                })
            
            return [types.TextContent(type="text", text=json.dumps(notes_with_tags, indent=2))]
    
    elif name == "search_notes":
        query = arguments.get("query", "").strip()
        limit = min(max(arguments.get("limit", 20), 1), 50)
        
        if not query:
            return [types.TextContent(type="text", text="[]")]
        
        query_lower = f"%{query.lower()}%"
        
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Note)
                .where(
                    or_(
                        Note.title.ilike(query_lower),
                        Note.content.ilike(query_lower),
                    )
                )
                .order_by(Note.updated_at.desc())
                .limit(limit)
            )
            notes = list(result.scalars().all())
            
            results = []
            for note in notes:
                tags_result = await db.execute(
                    select(Tag.name)
                    .join(NoteTag, Tag.id == NoteTag.tag_id)
                    .where(NoteTag.note_id == note.id)
                )
                tags = [row[0] for row in tags_result.all()]
                
                match_in_title = query.lower() in note.title.lower()
                match_in_content = query.lower() in note.content.lower()
                if match_in_title and match_in_content:
                    match_type = "both"
                elif match_in_title:
                    match_type = "title"
                else:
                    match_type = "content"
                
                results.append({
                    "id": str(note.id),
                    "title": note.title,
                    "content": note.content,
                    "created_at": note.created_at.isoformat(),
                    "updated_at": note.updated_at.isoformat(),
                    "tags": tags,
                    "match_type": match_type,
                })
            
            return [types.TextContent(type="text", text=json.dumps(results, indent=2))]
    
    elif name == "create_note":
        title = str(arguments.get("title", "")).strip()
        content = str(arguments.get("content", "")).strip()
        raw_tags = arguments.get("tags", [])
        
        if not title:
            return [types.TextContent(type="text", text="Error: 'title' is required and cannot be empty.")]
        
        if isinstance(raw_tags, str):
            tags = [t.strip() for t in raw_tags.split(",") if t.strip()]
        elif isinstance(raw_tags, list):
            tags = [str(t).strip() for t in raw_tags if str(t).strip()]
        else:
            tags = []
        
        note_data = NoteCreate(
            title=title,
            content=content,
            tags=tags,
        )
        
        try:
            async with AsyncSessionLocal() as db:
                created = await create_note(db, note_data)
                created_tags = await get_note_tags(db, created.id)
                
                response = {
                    "status": "success",
                    "id": str(created.id),
                    "title": created.title,
                    "content": created.content,
                    "tags": created_tags,
                    "created_at": created.created_at.isoformat(),
                    "updated_at": created.updated_at.isoformat(),
                    "message": f"Successfully created note '{created.title}' (ID: {created.id}) with tags: {created_tags}",
                }
                return [types.TextContent(type="text", text=json.dumps(response, indent=2))]
        except Exception as e:
            return [types.TextContent(type="text", text=f"Error creating note: {str(e)}")]
    
    else:
        return [types.TextContent(type="text", text=f"Unknown tool: {name}")]


async def main():
    """Initialize database and run MCP server over stdio."""
    # Ensure database is initialized
    await init_db()
    
    # Run MCP server (stdio transport)
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())