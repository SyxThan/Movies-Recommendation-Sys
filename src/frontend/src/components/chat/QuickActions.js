import React from 'react';

const QUICK_ACTIONS = [
  {
    label: "Gợi ý cho tôi",
    emoji: "🎬",
    message: "Gợi ý phim phù hợp với sở thích của tôi",
  },
  {
    label: "Phim đang hot",
    emoji: "🔥",
    message: "Những phim đang thịnh hành nhất hiện tại là gì?",
  },
  {
    label: "Đang buồn",
    emoji: "😢",
    message: "Tôi đang buồn, gợi ý phim cảm xúc hay cho tôi",
  },
  {
    label: "Khoa học viễn tưởng",
    emoji: "🚀",
    message: "Gợi ý phim khoa học viễn tưởng hay nhất",
  },
];

export default function QuickActions({ onSend }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      padding: '20px 16px',
    }}>
      <div style={{
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 4,
      }}>
        Bạn muốn tôi giúp gì?
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
      }}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onSend(action.message)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.12)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.06)';
              e.target.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            <span>{action.emoji}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
