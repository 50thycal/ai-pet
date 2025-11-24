import type { Metadata } from 'next'
import { APP_CONFIG } from './config'

export const metadata: Metadata = {
  title: APP_CONFIG.title,
  description: APP_CONFIG.description,
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      name: 'AI Pet',
      iconUrl: 'https://ai-pet-zeta.vercel.app/icon.png',
      homeUrl: 'https://ai-pet-zeta.vercel.app',
      imageUrl: 'https://ai-pet-zeta.vercel.app/image.png',
      buttonTitle: 'Check this out',
      splashImageUrl: 'https://ai-pet-zeta.vercel.app/splash.png',
      splashBackgroundColor: '#eeccff',
      webhookUrl: 'https://ai-pet-zeta.vercel.app/api/webhook',
    }),
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
