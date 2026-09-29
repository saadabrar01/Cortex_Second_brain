import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    title = Column(String(200), nullable=False, index=True)
    content = Column(Text, nullable=False, default="")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    tags = relationship("Tag", secondary="note_tags", back_populates="notes")

    __table_args__ = (
        Index("ix_notes_created_at", "created_at"),
        Index("ix_notes_updated_at", "updated_at"),
    )

    def __repr__(self):
        return f"<Note(id={self.id}, title={self.title})>"


class Tag(Base):
    __tablename__ = "tags"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name = Column(String(50), nullable=False, unique=True, index=True)

    notes = relationship("Note", secondary="note_tags", back_populates="tags")

    def __repr__(self):
        return f"<Tag(name={self.name})>"


class NoteTag(Base):
    __tablename__ = "note_tags"

    note_id = Column(
        UUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        UniqueConstraint("note_id", "tag_id", name="uq_note_tag"),
    )