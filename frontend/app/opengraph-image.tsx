import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CivicGuide AI';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #FF9933 0%, #138808 50%, #000080 100%)',
          color: 'white',
          padding: 64,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            border: '6px solid rgba(255,255,255,0.25)',
            borderRadius: 36,
            padding: 56,
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 2, textTransform: 'uppercase' }}>CivicGuide AI</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>Learn Indian elections with AI</div>
            <div style={{ fontSize: 28, opacity: 0.95, maxWidth: 900 }}>
              Voter registration, quizzes, civic education, and multilingual guidance for every citizen.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
