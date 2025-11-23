'use client'

import { AuthCard } from '@/components/AuthCard'
import { ChatCard } from '@/components/ChatCard'
import { useAuthSession } from '@/hooks/useAuthSession'
import { APP_CONFIG } from './config'

export default function Home() {
  const { isInMiniApp, user, status } = useAuthSession()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <h1>{APP_CONFIG.title}</h1>
        <p>{APP_CONFIG.description}</p>

        <AuthCard />

        {user?.fid && isInMiniApp && status === 'signedIn' && (
          <ChatCard fid={user.fid} />
        )}

        {!isInMiniApp && (
          <p style={{ textAlign: 'center', color: '#666' }}>
            Please sign in with Farcaster to use this app
          </p>
        )}
      </div>
    </div>
  )
}
