import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kairos — チームで走ろう',
  description: 'チームを主たる社会単位として設計されたランニングプラットフォーム',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
