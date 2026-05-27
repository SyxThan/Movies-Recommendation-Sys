import React from 'react';
import MovieRecommendationCarousel from './MovieRecommendationCarousel';

export default function ChatMessage({ message }) {
  const isUser = message.sender_type === 'user';
  const movies = message.recommended_movies_data || [];

  return (
    <div className={`mb-3 flex max-w-full flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] break-words whitespace-pre-wrap px-3.5 py-2.5 text-[0.9rem] leading-6 text-white ${isUser ? 'rounded-[16px_16px_4px_16px] bg-[linear-gradient(135deg,var(--primary,#6366f1),#4f46e5)]' : 'rounded-[16px_16px_16px_4px] bg-white/10'}`}
      >
        {message.content}
      </div>

      {movies.length > 0 && (
        <div className="mt-2 w-full">
          <MovieRecommendationCarousel movies={movies} />
        </div>
      )}
    </div>
  );
}
