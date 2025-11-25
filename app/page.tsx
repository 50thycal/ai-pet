'use client'

import { useEffect, useState } from 'react'
import { AuthCard } from '@/components/AuthCard'
import { ChatCard } from '@/components/ChatCard'
import { useAuthSession } from '@/hooks/useAuthSession'
import { APP_CONFIG } from './config'

interface AIProfile {
  hasProfile: boolean
  fid?: number
  signerUuid?: string
}

export default function Home() {
  const { isInMiniApp, user, status } = useAuthSession()
  const [aiProfile, setAiProfile] = useState<AIProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
  })

  // Fetch existing AI profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/ai-profile')
        if (!response.ok) throw new Error('Failed to fetch AI profile')
        const data = await response.json()
        setAiProfile(data)
      } catch (error) {
        console.error('Error fetching AI profile:', error)
        setProfileError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.displayName || !formData.username || !formData.bio) return

    try {
      setCreateLoading(true)
      setProfileError(null)

      const response = await fetch('/api/create-ai-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create profile')
      }

      const result = await response.json()
      setAiProfile({
        hasProfile: true,
        fid: result.fid,
        signerUuid: result.signerUuid,
      })

      // Clear form
      setFormData({ displayName: '', username: '', bio: '' })
    } catch (error) {
      console.error('Error creating AI profile:', error)
      setProfileError(error instanceof Error ? error.message : 'Failed to create profile')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <h1>{APP_CONFIG.title}</h1>
        <p>{APP_CONFIG.description}</p>

        <AuthCard />

        {/* AI Profile Section */}
        <div style={{
          padding: '1rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          marginTop: '1rem',
          backgroundColor: '#f9fafb',
        }}>
          <h2 style={{ marginTop: 0 }}>AI Pet Profile</h2>

          {profileLoading ? (
            <p style={{ color: '#666' }}>Loading AI profile...</p>
          ) : aiProfile?.hasProfile ? (
            <div>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Profile created!</strong>
              </p>
              <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 500 }}>FID:</span> {aiProfile.fid}
              </p>
              <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 500 }}>Signer UUID:</span>{' '}
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  {aiProfile.signerUuid?.slice(0, 8)}...{aiProfile.signerUuid?.slice(-8)}
                </span>
              </p>
              <a
                href={`https://warpcast.com/~/profiles/${aiProfile.fid}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  borderRadius: '0.25rem',
                  textDecoration: 'none',
                }}
              >
                View on Warpcast
              </a>
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '0.25rem',
                fontSize: '12px',
              }}>
                <strong>Note:</strong> To persist this profile across deployments, add these to your environment variables:
                <pre style={{ marginTop: '0.5rem', fontSize: '11px' }}>
AI_PET_PROFILE_FID={aiProfile.fid}{'\n'}AI_PET_PROFILE_SIGNER_UUID={aiProfile.signerUuid}
                </pre>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateProfile}>
              {profileError && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.25rem',
                  marginBottom: '0.5rem',
                  color: '#dc2626',
                  fontSize: '14px',
                }}>
                  {profileError}
                </div>
              )}

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px', fontWeight: 500 }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="My AI Pet"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #d1d5db',
                    fontFamily: 'inherit',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px', fontWeight: 500 }}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="my-ai-pet"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #d1d5db',
                    fontFamily: 'inherit',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px', fontWeight: 500 }}>
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="I'm an AI companion that loves to chat!"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #d1d5db',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={createLoading || !formData.displayName || !formData.username || !formData.bio}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: createLoading ? '#ccc' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: createLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {createLoading ? 'Creating AI Profile...' : 'Create AI Profile'}
              </button>
            </form>
          )}
        </div>

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
