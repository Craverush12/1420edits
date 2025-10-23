import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")
  if (!email) return NextResponse.json({ packs: [] })

  try {
    // Create Supabase client
    const supabase = await createServerClient()

    // Get user's download access
    const { data: downloads, error } = await supabase
      .from('download_links')
      .select('pack_id')
      .eq('user_email', email)
      .gt('expires_at', new Date().toISOString())

    if (error) {
      console.error('Failed to query download links:', error)
      return NextResponse.json({ packs: [] })
    }

    if (!downloads || downloads.length === 0) {
      return NextResponse.json({ packs: [] })
    }

    // Get tracks for each pack
    const packIds = downloads.map(d => d.pack_id)
    const { data: tracks, error: tracksError } = await supabase
      .from('pack_downloads')
      .select('*')
      .in('pack_id', packIds)
      .order('pack_id, track_order')

    if (tracksError) {
      console.error('Failed to query tracks:', tracksError)
      return NextResponse.json({ packs: [] })
    }

    // Group tracks by pack
    const packs = packIds.map(packId => ({
      packId,
      tracks: tracks
        .filter(track => track.pack_id === packId)
        .map(track => ({
          id: track.id,
          title: track.track_title,
          format: track.file_format,
          bitDepth: track.bit_depth,
          sampleRate: track.sample_rate,
          size: track.file_size,
          downloadUrl: `/api/download/track/${track.id}?email=${email}`
        }))
    }))

    return NextResponse.json({ packs })

  } catch (error) {
    console.error('Downloads API error:', error)
    return NextResponse.json({ packs: [] })
  }
}
