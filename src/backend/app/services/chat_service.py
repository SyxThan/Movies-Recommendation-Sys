"""
Chat Service — quản lý session/message và gọi agent.

Toàn bộ logic phân loại intent và generate response được delegate cho agent.
"""

from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.chat import ChatSession, ChatMessage
from app.models.enums import SenderEnum
from app.models import User
from app.services.chat_agent import run_agent


# --- Session Management ---

def create_chat_session(db: Session, user_id: UUID) -> ChatSession:
    session = ChatSession(user_id=user_id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_user_chat_sessions(db: Session, user_id: UUID) -> List[ChatSession]:
    return (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(ChatSession.created_at.desc())
        .all()
    )


def get_chat_session(db: Session, session_id: UUID) -> Optional[ChatSession]:
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()


def delete_chat_session(db: Session, session_id: UUID) -> bool:
    session = get_chat_session(db, session_id)
    if not session:
        return False
    db.delete(session)
    db.commit()
    return True


# --- Message Management ---

def save_message(
    db: Session,
    session_id: UUID,
    sender_type: SenderEnum,
    content: str,
    recommended_movie_ids: Optional[List[int]] = None,
) -> ChatMessage:
    msg = ChatMessage(
        session_id=session_id,
        sender_type=sender_type,
        content=content,
        recommended_movies=recommended_movie_ids or [],
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_session_messages(db: Session, session_id: UUID) -> List[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


# --- Agent Invocation ---

async def process_message(
    db: Session,
    user: User,
    session_id: UUID,
    message: str,
) -> dict:
    # 0. Input sanitization
    message = message.strip()
    if not message:
        raise ValueError("Message không được để trống")
    if len(message) > 500:
        message = message[:500]

    # 1. Validate session thuộc về user
    session = get_chat_session(db, session_id)
    if not session or str(session.user_id) != str(user.id):
        raise ValueError("Session không tồn tại hoặc không có quyền truy cập")

    # 2. Lưu user message
    user_msg = save_message(db, session_id, SenderEnum.user, message)

    # 3. Gọi agent (truyền User object thay vì user_id)
    agent_result = await run_agent(db, user, message)

    # 4. Lưu bot response kèm movie IDs
    movie_ids = [m["id"] for m in agent_result["recommended_movies"]]
    bot_msg = save_message(
        db, session_id, SenderEnum.bot,
        agent_result["text"], movie_ids
    )

    return {
        "user_message": user_msg,
        "bot_response": bot_msg,
        "recommended_movies": agent_result["recommended_movies"],
    }
