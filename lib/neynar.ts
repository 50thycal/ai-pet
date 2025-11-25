/**
 * Neynar API helpers for AI Pet profile creation
 * Docs: https://docs.neynar.com/reference
 */

const NEYNAR_BASE_URL = 'https://api.neynar.com/v2/farcaster'

/**
 * Wrapper for Neynar API calls with authentication and error handling
 */
async function neynarFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.NEYNAR_API_KEY
  if (!apiKey) {
    throw new Error('NEYNAR_API_KEY is not configured')
  }

  const url = `${NEYNAR_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Neynar API error (${response.status}): ${errorText}`
    )
  }

  return response.json() as Promise<T>
}

/**
 * Mint a fresh FID using Neynar's developer-managed user endpoint
 * Returns the newly created FID
 */
export async function fetchFreshFid(): Promise<number> {
  const result = await neynarFetch<{
    fids: number[]
  }>('/dev_managed_user/bulk', {
    method: 'POST',
    body: JSON.stringify({ count: 1 }),
  })

  if (!result.fids || result.fids.length === 0) {
    throw new Error('No FID returned from Neynar')
  }

  return result.fids[0]
}

/**
 * Create a managed signer for the given FID
 * Returns the signer UUID
 */
export async function createManagedSigner(fid: number): Promise<string> {
  const result = await neynarFetch<{
    signer_uuid: string
    public_key: string
    status: string
  }>('/signer/developer_managed', {
    method: 'POST',
    body: JSON.stringify({ fid }),
  })

  if (!result.signer_uuid) {
    throw new Error('No signer UUID returned from Neynar')
  }

  return result.signer_uuid
}

interface RegisterAccountParams {
  signerUuid: string
  username: string
  displayName: string
  bio: string
  pfpUrl?: string
}

interface RegisterAccountResult {
  success: boolean
  username: string
  message?: string
}

/**
 * Register a new account with username, bio, and display name
 * Uses the managed signer to sign the registration
 */
export async function registerNewAccount(
  params: RegisterAccountParams
): Promise<RegisterAccountResult> {
  const { signerUuid, username, displayName, bio, pfpUrl } = params

  const result = await neynarFetch<RegisterAccountResult>('/fid', {
    method: 'PUT',
    body: JSON.stringify({
      signer_uuid: signerUuid,
      fname: username,
      bio,
      display_name: displayName,
      ...(pfpUrl && { pfp_url: pfpUrl }),
    }),
  })

  return result
}
