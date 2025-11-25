/**
 * Neynar API helpers for AI Pet profile creation
 * Using @neynar/nodejs-sdk v2
 * Docs: https://docs.neynar.com/reference
 */

import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

/**
 * Get or create Neynar API client instance
 */
function getNeynarClient(): NeynarAPIClient {
  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    throw new Error('NEYNAR_API_KEY is not configured')
  }

  const config = new Configuration({ apiKey })
  return new NeynarAPIClient(config)
}

/**
 * Fetch a fresh FID from Neynar
 * Uses GET /v2/farcaster/user/fid endpoint
 * Returns the newly allocated FID
 */
export async function fetchFreshFid(): Promise<number> {
  const client = getNeynarClient()

  try {
    const response = await client.getFreshAccountFID()

    if (!response || !response.fid) {
      throw new Error('No FID returned from Neynar')
    }

    return response.fid
  } catch (error) {
    console.error('Error fetching fresh FID:', error)
    throw new Error(
      error instanceof Error
        ? `Failed to fetch FID: ${error.message}`
        : 'Failed to fetch FID from Neynar'
    )
  }
}

/**
 * Create a managed signer
 * Uses POST /v2/farcaster/signer endpoint
 * Returns the signer UUID
 */
export async function createManagedSigner(): Promise<string> {
  const client = getNeynarClient()

  try {
    const response = await client.createSigner()

    if (!response || !response.signer_uuid) {
      throw new Error('No signer UUID returned from Neynar')
    }

    return response.signer_uuid
  } catch (error) {
    console.error('Error creating managed signer:', error)
    throw new Error(
      error instanceof Error
        ? `Failed to create signer: ${error.message}`
        : 'Failed to create signer from Neynar'
    )
  }
}

interface UpdateProfileParams {
  signerUuid: string
  displayName: string
  bio: string
  pfpUrl?: string
}

interface UpdateProfileResult {
  success: boolean
  message?: string
}

/**
 * Update user profile with display name, bio, and optional profile picture
 * Uses PATCH /v2/farcaster/user endpoint
 * Uses the managed signer to sign the update
 */
export async function updateUserProfile(
  params: UpdateProfileParams
): Promise<UpdateProfileResult> {
  const client = getNeynarClient()
  const { signerUuid, displayName, bio, pfpUrl } = params

  try {
    const updateParams: {
      signerUuid: string
      bio?: string
      displayName?: string
      pfpUrl?: string
    } = {
      signerUuid,
    }

    if (bio) updateParams.bio = bio
    if (displayName) updateParams.displayName = displayName
    if (pfpUrl) updateParams.pfpUrl = pfpUrl

    await client.updateUser(updateParams)

    return {
      success: true,
      message: 'Profile updated successfully',
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error(
      error instanceof Error
        ? `Failed to update profile: ${error.message}`
        : 'Failed to update profile'
    )
  }
}
