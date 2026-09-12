import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '圖片配對小高手｜自訂圖片翻牌遊戲',
  description: '自行匯入多張圖片，翻牌找出相同的兩張；配對正確會留在原位，關閉網頁後圖片自動刪除。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
