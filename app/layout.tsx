import type { Metadata } from 'next'
import { APP_CONFIG } from './config'

export const metadata: Metadata = {
  title: APP_CONFIG.title,
  description: APP_CONFIG.description,
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: 'https://ai-pet-zeta.vercel.app/splash.png',
      button: {
        title: 'AI Pet',
        action: {
          type: 'launch_miniapp',
          name: 'AI Pet',
          url: 'https://ai-pet-zeta.vercel.app/',
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
      <body
        style={{
          margin: 0,
          padding: '20px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  )
}
