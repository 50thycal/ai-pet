import type { Metadata } from 'next'
import { APP_CONFIG } from './config'

export const metadata: Metadata = {
  title: APP_CONFIG.title,
  description: APP_CONFIG.description,
  other: {
    'farcaster:version': '1',
    'farcaster:iconUrl': 'https://miniapps-ai-pet.vercel.app/icon.png',
    'farcaster:homeUrl': 'https://miniapps-ai-pet.vercel.app',
    'farcaster:splashImageUrl': 'https://miniapps-ai-pet.vercel.app/splash.png',
    'farcaster:webhookUrl': 'https://miniapps-ai-pet.vercel.app/api/webhook',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
