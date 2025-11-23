'use client'

import { useAuthSession } from '@/hooks/useAuthSession'

export function AuthCard() {
  const { isInMiniApp, status, user, error, signIn, signOut } = useAuthSession()

  if (!isInMiniApp) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fef3c7',
        border: '1px solid #fcd34d',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
      }}>
        <p style={{ margin: 0 }}>
          This app requires opening from within a Farcaster client to enable sign-in functionality.
        </p>
      </div>
    )
  }

  if (status === 'signedIn' && user) {
    return (
      <div style={{
        padding: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        backgroundColor: '#f9fafb',
      }}>
        <p><strong>Signed in!</strong></p>
        <p>FID: {user.fid}</p>
        {user.username && <p>Username: @{user.username}</p>}
        {user.displayName && <p>Display Name: {user.displayName}</p>}
        <button
          onClick={signOut}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '0.25rem',
          marginBottom: '0.5rem',
          color: '#dc2626',
        }}>
          {error}
        </div>
      )}
      <button
        onClick={signIn}
        disabled={status === 'loading'}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#a855f7',
          color: 'white',
          border: 'none',
          borderRadius: '2rem',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.5 : 1,
        }}
      >
        {status === 'loading' ? 'Signing in...' : 'Sign In with Farcaster'}
      </button>
    </div>
  )
}
