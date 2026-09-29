import asyncio
import sys
sys.path.insert(0, r'E:\AI\MCP\cortex-second-brain-dashboard-nextjs\backend')

from database import init_db, AsyncSessionLocal
from models import Note, NoteTag, Tag
from sqlalchemy import select, func, or_

async def test_tools():
    await init_db()
    
    # Test get_notes_count
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(func.count(Note.id)))
        count = result.scalar_one()
        print(f'Total notes: {count}')
    
    # Test get_all_notes
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Note).order_by(Note.updated_at.desc()).limit(5)
        )
        notes = list(result.scalars().all())
        print(f'Latest 5 notes:')
        for note in notes:
            print(f'  - {note.title} ({note.id})')
    
    # Test search_notes
    async with AsyncSessionLocal() as db:
        query = 'MCP'
        query_lower = f'%{query.lower()}%'
        result = await db.execute(
            select(Note).where(
                or_(
                    Note.title.ilike(query_lower),
                    Note.content.ilike(query_lower),
                )
            ).limit(10)
        )
        notes = list(result.scalars().all())
        print(f'Search "{query}" results: {len(notes)}')
        for note in notes:
            print(f'  - {note.title}')

asyncio.run(test_tools())