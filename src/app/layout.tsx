import type {Metadata} from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quran Circle | Consistent Engagement',
  description: 'Maintain a daily connection with the Quran through habit-building and accountability.',
  icons: {
    icon: '/logo-premium.png',
    shortcut: '/logo-premium.png',
    apple: '/logo-premium.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 selection:text-primary-foreground min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#f97316" showSpinner={false} height={3} shadow="0 0 10px #f97316,0 0 5px #f97316" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
