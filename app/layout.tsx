import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '拼拼樂｜照片拼圖遊戲',
  description: '上傳喜歡的照片，選擇難度，開始拼圖挑戰！',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
