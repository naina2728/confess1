import { NextResponse } from 'next/server'

export async function GET() {
  const farcasterManifest = {
    "accountAssociation": {
      "header": "eyJmaWQiOjEwODk4NzksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1ZDczYzczNGQ3Yzg0OUUxNTRiNmYwNjczNjY0NDQ0MzJkOTdDZjE3In0",
      "payload": "eyJkb21haW4iOiJjb25mZXNzMS52ZXJjZWwuYXBwIn0",
      "signature": "MHhkMmE4MGYwZmM4MTY2MThmYTc0MGE3YzI5Njg1NzQyNzQzNTkwOTQ3NWNjZWVhMjFlZjEyZGNhZDZmYTZlNGUwNmZmM2I0NGI4YTA3YTdiMjNhYmM2ZTVhZjAwODNiNDI0OTVkYTkzNTdiNWJhYWQxNzZiMWIzNjEzMWI2NWZlNTFj"
    },
    "miniapp": {
      "name": "Spicy Confessions",
      "version": "1",
      "iconUrl": "https://confess1.vercel.app/icon.png",
      "homeUrl": "https://confess1.vercel.app",
      "imageUrl": "https://confess1.vercel.app/icon.png",
      "buttonTitle": "Share Confession",
      "splashImageUrl": "https://confess1.vercel.app/icon.png",
      "splashBackgroundColor": "#ff6b6b",
      "subtitle": "Anonymous spicy confessions",
      "description": "Share your secrets anonymously! Features spicy animations, mobile design, like system, timestamps, and modern UI with beautiful gradients.",
      "primaryCategory": "social",
      "screenshotUrls": [
        "https://confess1.vercel.app/header.png"
      ],
      "heroImageUrl": "https://confess1.vercel.app/icon.png",
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
      "ogImageUrl": "https://confess1.vercel.app/icon.png"
    }
  }

  return NextResponse.json(farcasterManifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
