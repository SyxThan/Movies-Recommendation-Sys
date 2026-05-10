import React, { useState, useEffect } from 'react';
import MovieRow from '../components/movie/MovieRow';
import movieApi from '../api/movieApi';

const DEMO_TRENDING = [
  { id: 1, title: 'Interstellar', vote_average: 8.6, release_year: 2014 },
  { id: 2, title: 'Dune: Part Two', vote_average: 8.5, release_year: 2024 },
  { id: 3, title: 'Oppenheimer', vote_average: 8.4, release_year: 2023 },
  { id: 4, title: 'The Batman', vote_average: 7.8, release_year: 2022 },
  { id: 5, title: 'Blade Runner 2049', vote_average: 8.0, release_year: 2017 },
  { id: 6, title: 'Everything Everywhere All at Once', vote_average: 8.1, release_year: 2022 },
];

const TIME_FILTERS = [
  { label: 'Today', value: 'day' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
];

export default function TrendingPage() {
  const [period, setPeriod] = useState('week');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await movieApi.getTrending({ period, limit: 24 });
        setMovies(res.movies || res.items || res || []);
      } catch {
        setMovies(DEMO_TRENDING);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [period]);

  return (
    <div className="fade-in">
      <div className="top-bar">
        <div>
          <h1 className="display-md" style={{ marginBottom: 'var(--spacing-1)' }}>
            🔥 Trending
          </h1>
          <p className="body-md">What the world is watching right now</p>
        </div>
        {/* Time period filter */}
        <div style={{ display: 'flex', background: 'var(--surface-container)', borderRadius: 'var(--radius-xl)', padding: 4 }}>
          {TIME_FILTERS.map((f) => (
            <button
              key={f.value}
              id={`trending-filter-${f.value}`}
              onClick={() => setPeriod(f.value)}
              style={{
                padding: 'var(--spacing-2) var(--spacing-4)',
                borderRadius: 'calc(var(--radius-xl) - 4px)',
                background: period === f.value ? 'var(--surface-container-highest)' : 'transparent',
                color: period === f.value ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                fontWeight: period === f.value ? 600 : 400,
                border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trending rank list */}
      <div style={{ marginTop: 'var(--spacing-8)' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--spacing-5)' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
                <div className="skeleton" style={{ height: 14, marginTop: 10, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Top 3 spotlight */}
            {movies.slice(0, 3).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-5)', marginBottom: 'var(--spacing-10)' }}>
                {movies.slice(0, 3).map((movie, i) => (
                  <div
                    key={movie.id}
                    style={{
                      background: 'var(--surface-container)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--spacing-5)',
                      border: i === 0
                        ? '1px solid rgba(159,255,136,0.2)'
                        : i === 1
                        ? '1px solid rgba(0,210,253,0.15)'
                        : '1px solid rgba(73,72,71,0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      fontSize: '4rem', fontFamily: 'var(--font-display)', fontWeight: 800,
                      color: i === 0 ? 'rgba(159,255,136,0.12)' : i === 1 ? 'rgba(0,210,253,0.1)' : 'rgba(255,255,255,0.05)',
                      position: 'absolute', top: -8, right: 12, lineHeight: 1,
                    }}>
                      #{i + 1}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'flex-start' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                        background: `hsl(${i * 120}, 40%, 20%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', flexShrink: 0,
                      }}>🎬</div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{movie.title}</div>
                        <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.8125rem', marginTop: 4 }}>
                          {movie.release_year}
                        </div>
                        {movie.vote_average > 0 && (
                          <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', marginTop: 4 }}>
                            ★ {Number(movie.vote_average).toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rest of list */}
            <MovieRow
              title="All Trending"
              movies={movies.slice(3)}
              loading={false}
              cardWidth={180}
            />
          </>
        )}
      </div>
    </div>
  );
}
