'use client'

import { useCallback, useEffect, useState } from 'react'
import sdk from '@farcaster/miniapp-sdk'
import type { Context } from '@farcaster/miniapp-core'

interface User {
  fid: number
  address: string
  username?: string
  displayName?: string
  pfpUrl?: string
}

export function useAuthSession() {
  const [status, setStatus] = useState<'loading' | 'signedOut' | 'signedIn'>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null)

  // CRITICAL: Signal to Farcaster that app is ready
  useEffect(() => {
    sdk.actions.ready()

    sdk.isInMiniApp().then((inMiniApp) => {
      setIsInMiniApp(inMiniApp)
      if (!inMiniApp) {
        setStatus('signedOut')
      }
    })
  }, [])

  // Load user context when in miniapp
  useEffect(() => {
    if (isInMiniApp === false) {
      setStatus('signedOut')
      return
    }

    if (isInMiniApp === null) {
      return
    }

    let mounted = true

    async function loadContext() {
      try {
        const context: Context.MiniAppContext = await sdk.context
        if (!mounted) return

        if (context.user?.fid) {
          setUser({
            fid: context.user.fid,
            address: '', // Not provided by default context
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          })
          setStatus('signedIn')
        } else {
          setStatus('signedOut')
        }
      } catch (err) {
        if (!mounted) return
        console.error('Error loading MiniApp context:', err)
        setError(err instanceof Error ? err.message : 'Failed to load context')
        setStatus('signedOut')
      }
    }

    loadContext()

    return () => {
      mounted = false
    }
  }, [isInMiniApp])

  const signIn = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      // The SDK handles authentication automatically via QuickAuth
      // This is just for UI feedback
      setStatus('signedIn')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      setStatus('signedOut')
    }
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setStatus('signedOut')
  }, [])

  return {
    status,
    user,
    error,
    isInMiniApp: isInMiniApp ?? false,
    signIn,
    signOut,
  }
}
