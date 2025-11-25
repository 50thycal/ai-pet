import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const fid = process.env.AI_PET_PROFILE_FID
    const signerUuid = process.env.AI_PET_PROFILE_SIGNER_UUID

    if (!fid || !signerUuid) {
      return NextResponse.json({
        hasProfile: false,
      })
    }

    return NextResponse.json({
      hasProfile: true,
      fid: Number.parseInt(fid, 10),
      signerUuid,
    })
  } catch (error) {
    console.error('Error checking AI Pet profile:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check AI Pet profile',
      },
      { status: 500 }
    )
  }
}
