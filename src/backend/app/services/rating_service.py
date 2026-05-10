from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import uuid

from app.models import Rating, Movie
from app.api.schemas.interaction import RatingRequest


def upsert_rating(db: Session, user_id: uuid.UUID, payload: RatingRequest) -> Rating:
    """
    Upsert logic:
    - If the user already rated this movie → UPDATE rating_score.
    - Otherwise → INSERT new rating.
    """
    # Verify movie exists
    movie = db.query(Movie).filter(Movie.id == payload.movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with id={payload.movie_id} not found",
        )

    existing = (
        db.query(Rating)
        .filter(Rating.user_id == user_id, Rating.movie_id == payload.movie_id)
        .first()
    )

    if existing:
        # UPDATE
        existing.rating_score = payload.rating_score
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # INSERT
        new_rating = Rating(
            user_id=user_id,
            movie_id=payload.movie_id,
            rating_score=payload.rating_score,
        )
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return new_rating
