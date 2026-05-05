import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SkyVision — Prediksi Cuaca & Early Warning Indonesia',
  description:
    'Sistem prediksi cuaca real-time dan early warning bencana berbasis Machine Learning untuk seluruh wilayah Indonesia.',
  keywords: ['cuaca', 'BMKG', 'prediksi', 'early warning', 'Indonesia', 'machine learning'],
  authors: [{ name: 'SkyVision Team' }],
  openGraph: {
    title: 'SkyVision — Weather Prediction & Early Warning',
    description: 'Indonesia weather prediction powered by LSTM & Prophet ML models.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}