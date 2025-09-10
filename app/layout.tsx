import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/providers'

export const metadata: Metadata = {
  title: { default: 'Spicy Confessions', template: `%s - Spicy Confessions` },
  description: 'Share your secrets anonymously! Features spicy animations, mobile design, like system, timestamps, and modern UI with beautiful gradients.',
  keywords: ['anonymous', 'confessions', 'social', 'fun', 'community', 'secrets'],
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Spicy Confessions',
    description: 'Share your secrets anonymously with a fun, spicy design theme and modern UI.',
    images: [
      {
        url: 'https://confess1.vercel.app/header.png',
        secureUrl: 'https://confess1.vercel.app/header.png',
        alt: 'Spicy Confessions',
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spicy Confessions',
    description: 'Share your secrets anonymously with a fun, spicy design theme and modern UI.',
    creator: '@SpicyConfessions',
    images: ['https://confess1.vercel.app/header.png'],
  },
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: 'https://confess1.vercel.app/logo.png',
      button: {
        title: 'Share Confession',
        action: {
          type: 'launch_frame',
          name: 'Spicy Confessions',
          url: 'https://confess1.vercel.app',
          splashImageUrl: 'https://confess1.vercel.app/logo.png',
          splashBackgroundColor: '#ff6b6b',
        },
      },
    }),
    'fc:miniapp': JSON.stringify({
      version: 'next',
      imageUrl: 'https://confess1.vercel.app/logo.png',
      button: {
        title: 'Share Confession',
        action: {
          type: 'launch_frame',
          name: 'Spicy Confessions',
          url: 'https://confess1.vercel.app',
          splashImageUrl: 'https://confess1.vercel.app/icon.png',
          splashBackgroundColor: '#ff6b6b',
        },
      },
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
