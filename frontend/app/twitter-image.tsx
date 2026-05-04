import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CivicGuide AI';
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#FFFFFF',
          color: '#111827',
          padding: 48,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            border: '8px solid #FF9933',
            borderRadius: 32,
            padding: 56,
          }}
        >
          <div style={{ fontSize: 28, color: '#FF9933', letterSpacing: 2, textTransform: 'uppercase' }}>
            CivicGuide AI
          </div>
          <div style={{ marginTop: 16, fontSize: 66, fontWeight: 800, lineHeight: 1.05 }}>
            Democracy learning, made simple.
          </div>
          <div style={{ marginTop: 18, fontSize: 28, color: '#374151', maxWidth: 900 }}>
            Ask questions, take quizzes, and explore Indian elections in five languages.
          </div>
        </div>
      </div>
    ),
    size
  );
}
