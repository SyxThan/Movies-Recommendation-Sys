import React from 'react';
import MovieCard from '../movie/MovieCard';

export default function MovieRecommendationCarousel({ movies = [] }) {
  if (!movies.length) return null;

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      overflowX: 'auto',
      paddingBottom: 8,
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(255,255,255,0.2) transparent',
    }}>
      {movies.map((movie) => (
        <div key={movie.id} style={{ flexShrink: 0 }}>
          <MovieCard movie={movie} width={130} />
        </div>
      ))}
    </div>
  );
}
