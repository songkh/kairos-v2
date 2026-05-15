import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kairos — チームで走ろう',
  description: 'チームを主たる社会単位として設計されたランニングプラットフォーム',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
