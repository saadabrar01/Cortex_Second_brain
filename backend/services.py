import re
from typing import Optional
from uuid import UUID

from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models import Note, NoteTag, Tag
from schemas import NoteCreate, NoteUpdate


async def create_note(db: AsyncSession, note: NoteCreate) -> Note:
    db_note = Note(title=note.title, content=note.content)
    db.add(db_note)
    await db.flush()
    await _extract_and_save_tags(db, db_note, note.content, note.tags)
    await db.commit()
    await db.refresh(db_note)
    return db_note


async def get_note(db: AsyncSession, note_id: UUID) -> Optional[Note]:
    result = await db.execute(
        select(Note).where(Note.id == note_id)
    )
    return result.scalar_one_or_none()


async def get_notes(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Note]:
    result = await db.execute(
        select(Note).order_by(Note.updated_at.desc()).offset(skip).limit(limit)
    )
    return list(result.scalars().all())


async def get_note_tags(db: AsyncSession, note_id: UUID) -> list[str]:
    result = await db.execute(
        select(Tag.name)
        .join(NoteTag, Tag.id == NoteTag.tag_id)
        .where(NoteTag.note_id == note_id)
    )
    return [row[0] for row in result.all()]


async def update_note(db: AsyncSession, note_id: UUID, note: NoteUpdate) -> Optional[Note]:
    db_note = await get_note(db, note_id)
    if not db_note:
        return None

    db_note.title = note.title
    db_note.content = note.content

    await _extract_and_save_tags(db, db_note, note.content, note.tags)

    await db.commit()
    await db.refresh(db_note)
    return db_note


async def delete_note(db: AsyncSession, note_id: UUID) -> bool:
    db_note = await get_note(db, note_id)
    if not db_note:
        return False

    await db.delete(db_note)
    await db.commit()
    return True


async def get_notes_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Note.id)))
    return result.scalar_one()


async def search_notes(db: AsyncSession, query: str) -> list[Note]:
    query_lower = f"%{query.lower()}%"
    result = await db.execute(
        select(Note).where(
            or_(
                Note.title.ilike(query_lower),
                Note.content.ilike(query_lower),
            )
        ).order_by(Note.updated_at.desc())
    )
    return list(result.scalars().all())


async def get_suggestions(db: AsyncSession, query: str) -> list[str]:
    query_lower = query.lower()
    suggestions = set()

    notes = await search_notes(db, query)
    for note in notes:
        words = re.findall(r"\b\w{3,}\b", note.title + " " + note.content)
        for word in words:
            word_lower = word.lower()
            if query_lower in word_lower:
                suggestions.add(word_lower)

    return sorted(list(suggestions))[:10]


async def _extract_and_save_tags(
    db: AsyncSession,
    note: Note,
    content: str,
    explicit_tags: Optional[list[str]] = None,
) -> None:
    extracted = set(re.findall(r"#([\w-]+)", content))
    if explicit_tags:
        for t in explicit_tags:
            if isinstance(t, str):
                clean = t.lstrip("#").strip().lower()
                if clean:
                    extracted.add(clean)

    tag_names = {t.lstrip("#").strip().lower() for t in extracted if t.strip()}

    await db.execute(
        delete(NoteTag).where(NoteTag.note_id == note.id)
    )

    for tag_name in tag_names:
        result = await db.execute(
            select(Tag).where(func.lower(Tag.name) == tag_name)
        )
        tag = result.scalar_one_or_none()

        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
            await db.flush()

        note_tag = NoteTag(note_id=note.id, tag_id=tag.id)
        db.add(note_tag)


async def get_all_tags(db: AsyncSession) -> list[dict]:
    result = await db.execute(
        select(
            Tag.name,
            func.count(NoteTag.note_id).label("count")
        )
        .select_from(Tag)
        .outerjoin(NoteTag, Tag.id == NoteTag.tag_id)
        .group_by(Tag.id, Tag.name)
        .order_by(func.count(NoteTag.note_id).desc())
    )
    return [{"name": row.name, "count": row.count} for row in result.all()]


async def get_notes_by_tag(db: AsyncSession, tag_name: str) -> list[Note]:
    clean_tag = tag_name.lstrip("#").strip().lower()
    result = await db.execute(
        select(Note)
        .join(NoteTag, Note.id == NoteTag.note_id)
        .join(Tag, NoteTag.tag_id == Tag.id)
        .where(func.lower(Tag.name) == clean_tag)
        .order_by(Note.updated_at.desc())
    )
    return list(result.scalars().all())


async def get_related_notes(db: AsyncSession, note_id: UUID, limit: int = 5) -> list[Note]:
    note = await get_note(db, note_id)
    if not note:
        return []

    tag_result = await db.execute(
        select(Tag.name)
        .join(NoteTag, Tag.id == NoteTag.tag_id)
        .where(NoteTag.note_id == note_id)
    )
    tag_names = [row[0] for row in tag_result.all()]

    if not tag_names:
        return []

    result = await db.execute(
        select(Note)
        .join(NoteTag, Note.id == NoteTag.note_id)
        .join(Tag, NoteTag.tag_id == Tag.id)
        .where(Tag.name.in_(tag_names), Note.id != note_id)
        .group_by(Note.id)
        .order_by(func.count(Tag.id).desc(), Note.updated_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())