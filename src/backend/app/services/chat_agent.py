"""
Chat Agent — LangGraph ReAct Agent sử dụng Google Gemini.

Agent tự quyết định gọi tool nào dựa trên nội dung tin nhắn.
Không hardcode if/else keyword matching.
"""

import asyncio
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import User
from app.services.agent_tools import build_tools_with_context


SYSTEM_PROMPT = """Bạn là trợ lý AI chuyên về phim, hỗ trợ người dùng tìm kiếm và khám phá phim.

Nguyên tắc làm việc:
1. Luôn dùng tools để lấy dữ liệu thực từ hệ thống thay vì trả lời từ kiến thức chung
2. Khi gợi ý phim, ưu tiên gọi get_recommendations trước (cá nhân hóa cho user)
3. Khi user hỏi về nội dung/so sánh phim, gọi get_movie_detail với task phù hợp
4. Nếu cần so sánh 2 phim, gọi get_movie_detail 2 lần cho từng phim
5. Trả lời bằng tiếng Việt, thân thiện và súc tích
6. Khi trả về danh sách phim, giới thiệu ngắn gọn 1-2 câu cho mỗi phim

Bạn có thể giúp user:
- Tìm phim theo tên hoặc mô tả
- Gợi ý phim cá nhân hóa theo sở thích/tâm trạng/thể loại
- Tóm tắt nội dung phim, giải thích cái kết, chia sẻ easter eggs
- So sánh 2 bộ phim
- Xem phim đang hot/trending
- Tra cứu lịch sử xem
"""


MAX_RETRIES = 3
RETRY_BASE_DELAY = 5  # seconds


def get_llm():
    """Khởi tạo LLM (Google Gemini)."""
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.7,
        max_output_tokens=1000,
        max_retries=2,
    )


async def run_agent(db: Session, user: User, message: str) -> dict:
    """
    Chạy agent cho một tin nhắn (single-turn).
    Agent có thể gọi nhiều tools trong một lượt trước khi trả lời.

    Returns:
        {
            "text": str,                    # Câu trả lời của agent
            "recommended_movies": list[dict] # Phim từ tool results (nếu có)
        }
    """
    llm = get_llm()
    tools = build_tools_with_context(db, user)
    agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            result = await agent.ainvoke({
                "messages": [HumanMessage(content=message)]
            })

            raw_content = result["messages"][-1].content
            response_text = _normalize_content(raw_content)
            recommended_movies = _extract_movies_from_tool_results(result["messages"])

            return {
                "text": response_text,
                "recommended_movies": recommended_movies,
            }

        except Exception as e:
            last_error = e
            error_str = str(e).lower()
            is_rate_limit = "429" in error_str or "resource_exhausted" in error_str or "quota" in error_str

            if is_rate_limit and attempt < MAX_RETRIES - 1:
                delay = RETRY_BASE_DELAY * (2 ** attempt)
                print(f"[chat_agent] Rate limited (attempt {attempt + 1}/{MAX_RETRIES}), retrying in {delay}s...")
                await asyncio.sleep(delay)
                continue

            print(f"[chat_agent] Error (attempt {attempt + 1}): {e}")
            break

    error_msg = str(last_error).lower() if last_error else ""
    if "429" in error_msg or "resource_exhausted" in error_msg or "quota" in error_msg:
        return {
            "text": "Hệ thống đang tải cao, vui lòng thử lại sau 30 giây.",
            "recommended_movies": [],
        }
    return {
        "text": "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
        "recommended_movies": [],
    }


def _normalize_content(content) -> str:
    """
    Gemini 2.5 có thể trả content dạng list[dict] thay vì string.
    Ví dụ: [{'type': 'text', 'text': '...'}]
    Hàm này normalize về plain string.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict):
                parts.append(item.get("text", ""))
            elif isinstance(item, str):
                parts.append(item)
        return "".join(parts)
    return str(content)


def _extract_movies_from_tool_results(messages: list) -> list[dict]:
    """
    Duyệt qua messages để tìm ToolMessage chứa danh sách phim.
    Trả về list movie objects để frontend render carousel.
    """
    movies = []
    seen_ids = set()

    for msg in messages:
        if not hasattr(msg, "content"):
            continue

        content = msg.content
        if not isinstance(content, str):
            continue

        try:
            data = json.loads(content)
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "id" in item and "title" in item:
                        if item["id"] not in seen_ids:
                            movies.append(item)
                            seen_ids.add(item["id"])
        except (json.JSONDecodeError, TypeError):
            continue

    return movies
