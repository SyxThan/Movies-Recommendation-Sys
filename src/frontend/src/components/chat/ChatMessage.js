import React from 'react';
import MovieRecommendationCarousel from './MovieRecommendationCarousel';

export default function ChatMessage({ message }) {
  const isUser = message.sender_type === 'user';
  const movies = message.recommended_movies_data || [];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      maxWidth: '100%',
    }}>
      <div style={{
        maxWidth: '85%',
        padding: '10px 14px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser
          ? 'linear-gradient(135deg, var(--primary, #6366f1), var(--primary-dark, #4f46e5))'
          : 'rgba(255, 255, 255, 0.08)',
        color: '#fff',
        fontSize: '0.9rem',
        lineHeight: 1.5,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
      }}>
        {message.content}
      </div>

      {movies.length > 0 && (
        <div style={{ marginTop: 8, width: '100%' }}>
          <MovieRecommendationCarousel movies={movies} />
        </div>
      )}
    </div>
  );
}
