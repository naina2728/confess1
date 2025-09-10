import { NextResponse } from 'next/server'

export async function GET() {
  const farcasterManifest = {
    "miniapp": {
      "name": "Spicy Confessions",
      "version": "1",
      "iconUrl": "https://confess1.vercel.app/public/icon.png",
      "homeUrl": "https://confess1.vercel.app",
      "imageUrl": "https://confess1.vercel.app/public/header.png",
      "buttonTitle": "Share Confession",
      "splashImageUrl": "https://confess1.vercel.app/public/icon.png",
      "splashBackgroundColor": "#ff6b6b",
      "subtitle": "Anonymous spicy confessions",
      "description": "Share your secrets anonymously! Features spicy animations, mobile design, like system, timestamps, and modern UI with beautiful gradients.",
      "primaryCategory": "social",
      "screenshotUrls": [
        "https://confess1.vercel.app/public/header.png"
      ],
      "heroImageUrl": "https://confess1.vercel.app/public/header.png",
      "tags": [
        "social",
        "anonymous",
        "confessions",
        "fun",
        "community"
      ],
      "tagline": "Share Your Spicy Secrets",
      "ogTitle": "Spicy Confessions",
      "ogDescription": "Share your secrets anonymously with a fun, spicy design theme and modern UI.",
      "ogImageUrl": "https://confess1.vercel.app/public/icon.png"
    }
  }

  return NextResponse.json(farcasterManifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
