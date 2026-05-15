export default function HomePage(): React.ReactElement {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 640, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: '#E8642A' }}>Kairos</h1>
      <p style={{ fontSize: 20, color: '#1A1A2E', marginTop: 16 }}>
        チームを主たる社会単位として設計された<br />初めてのランニングプラットフォーム。
      </p>
      <p style={{ marginTop: 32, color: '#6B7280' }}>2026年9月 日本ローンチ予定</p>
      <div style={{ marginTop: 48, padding: 24, background: '#F7F5F0', borderRadius: 12 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>
          API: <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://kairos-v2-e7qr.onrender.com'}/health`} style={{ color: '#E8642A' }}>Health Check</a>
        </p>
      </div>
    </main>
  );
}
