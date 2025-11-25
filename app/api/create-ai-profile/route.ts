import { NextRequest, NextResponse } from 'next/server'
import {
  fetchFreshFid,
  createManagedSigner,
  registerNewAccount,
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

    if (!displayName || !username || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields: displayName, username, and bio are required' },
        { status: 400 }
      )
    }

    // Step 1: Mint a fresh FID
    console.log('Minting fresh FID...')
    const fid = await fetchFreshFid()
    console.log(`Created FID: ${fid}`)

    // Step 2: Create a managed signer for this FID
    console.log(`Creating managed signer for FID ${fid}...`)
    const signerUuid = await createManagedSigner(fid)
    console.log(`Created signer: ${signerUuid}`)

    // Step 3: Register the account with username, bio, etc.
    console.log(`Registering account with username: ${username}...`)
    const result = await registerNewAccount({
      signerUuid,
      username,
      displayName,
      bio,
      pfpUrl,
    })

    if (!result.success) {
      throw new Error(result.message || 'Failed to register account')
    }

    console.log(`Successfully created AI Pet profile with FID ${fid}`)

    return NextResponse.json({
      fid,
      signerUuid,
      username: result.username,
      message: 'AI Pet profile created successfully',
    })
  } catch (error) {
    console.error('Error creating AI Pet profile:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create AI Pet profile',
      },
      { status: 500 }
    )
  }
}
