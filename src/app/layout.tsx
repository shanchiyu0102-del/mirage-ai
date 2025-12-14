import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MirageAI - AI视频生成平台',
  description: '基于AI的故事视频生成平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}