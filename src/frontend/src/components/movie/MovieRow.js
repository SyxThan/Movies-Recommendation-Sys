import React from 'react';
import MovieCard from './MovieCard';

export default function MovieRow({
  title,
  subtitle,
  badge,
  movies = [],
  loading = false,
  cardWidth = 180,
  onSeeAll,
  emptyMessage = 'No movies found.',
}) {
  const skeletons = Array.from({ length: 6 });

  return (
    <div style={{ marginBottom: 'var(--spacing-10)' }}>
      <div className="section-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <h2 className="section-title" style={{ margin: 0 }}>{title}</h2>
            {badge && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: badge.bg || 'rgba(159,255,136,0.12)',
                  color: badge.color || 'var(--primary)',
                  border: `1px solid ${badge.border || 'rgba(159,255,136,0.25)'}`,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
                title={badge.tooltip}
              >
                {badge.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p style={{
              margin: 0,
              fontSize: '0.8125rem',
              color: 'var(--on-surface-variant)',
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {movies.length > 6 && onSeeAll && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--secondary)', fontSize: '0.8125rem' }}
            onClick={onSeeAll}
          >
            See all →
          </button>
        )}
      </div>

      <div className="scroll-row">
        {loading
          ? skeletons.map((_, i) => (
              <div key={i} style={{ width: cardWidth, flexShrink: 0 }}>
                <div className="skeleton" style={{ width: cardWidth, aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
                <div className="skeleton" style={{ height: 14, marginTop: 10, borderRadius: 4, width: '80%' }} />
                <div className="skeleton" style={{ height: 12, marginTop: 6, borderRadius: 4, width: '50%' }} />
              </div>
            ))
          : movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} width={cardWidth} />
            ))
        }
        {!loading && movies.length === 0 && (
          <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', padding: 'var(--spacing-8)' }}>
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
