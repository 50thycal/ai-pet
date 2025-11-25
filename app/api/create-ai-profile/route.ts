import { NextRequest, NextResponse } from 'next/server'
import {
  fetchFreshFid,
  createManagedSigner,
  updateUserProfile,
} from '@/lib/neynar'

interface CreateProfileRequest {
  displayName: string
  username: string
  bio: string
  pfpUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProfileRequest = await request.json()
    const { displayName, username, bio, pfpUrl } = body

    if (!displayName || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields: displayName and bio are required' },
        { status: 400 }
      )
    }

    // Step 1: Fetch a fresh FID from Neynar
    console.log('Fetching fresh FID...')
    const fid = await fetchFreshFid()
    console.log(`Allocated FID: ${fid}`)

    // Step 2: Create a managed signer
    console.log('Creating managed signer...')
    const signerUuid = await createManagedSigner()
    console.log(`Created signer: ${signerUuid}`)

    // Step 3: Update user profile with display name, bio, etc.
    console.log('Updating user profile...')
    const result = await updateUserProfile({
      signerUuid,
      displayName,
      bio,
      pfpUrl,
    })

    if (!result.success) {
      throw new Error(result.message || 'Failed to update profile')
    }

    console.log(`Successfully created AI Pet profile with FID ${fid}`)

    return NextResponse.json({
      fid,
      signerUuid,
      username: username || `user-${fid}`,
      display_name: displayName,
      message: 'AI Pet profile created successfully',
    })
  } catch (error) {
    console.error('Error creating AI Pet profile:', error)

    // Extract detailed error message from Neynar API if available
    let errorMessage = 'Failed to create AI Pet profile'
    let errorDetails: string | undefined

    if (error instanceof Error) {
      errorMessage = error.message
      // Check if it's an Axios error with response data
      if ('response' in error && typeof error.response === 'object' && error.response) {
        const response = error.response as { data?: { message?: string } }
        errorDetails = response.data?.message
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        ...(errorDetails && { details: errorDetails }),
      },
      { status: 500 }
    )
  }
}
