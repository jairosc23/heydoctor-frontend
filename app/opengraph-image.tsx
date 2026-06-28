import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HeyDoctor Enterprise';
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
          alignItems: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #312e81 55%, #0f172a 100%)',
          color: 'white',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          padding: '72px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div
            style={{
              border: '1px solid rgba(165, 180, 252, 0.55)',
              borderRadius: '999px',
              color: '#c7d2fe',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 5,
              padding: '12px 22px',
              textTransform: 'uppercase',
              width: 'max-content',
            }}
          >
            HeyDoctor Enterprise
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 0.95, maxWidth: 920 }}>
              Plataforma clínica con IA gobernada
            </div>
            <div style={{ color: '#dbeafe', fontSize: 34, lineHeight: 1.25, maxWidth: 860 }}>
              Clinical Foundation · Knowledge Graph · PHI-safe · Production Ready
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
