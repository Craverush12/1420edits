import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { packId: string } }
) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return Response.json({ error: 'Email required' }, { status: 400 })
  }
  
  const supabase = createClient()
  
  // Verify user has access to this pack
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('email', email)
    .contains('pack_ids', [params.packId])
    .single()
  
  if (!order) {
    return Response.json({ error: 'Access denied' }, { status: 403 })
  }
  
  // Get all tracks for this pack
  const { data: tracks, error } = await supabase
    .from('pack_downloads')
    .select('*')
    .eq('pack_id', params.packId)
    .order('track_order')
  
  if (error) {
    return Response.json({ error: 'Database error' }, { status: 500 })
  }
  
  return Response.json({ 
    packId: params.packId,
    tracks: tracks.map(track => ({
      id: track.id,
      title: track.track_title,
      format: track.file_format,
      bitDepth: track.bit_depth,
      sampleRate: track.sample_rate,
      size: track.file_size,
      downloadUrl: `/api/download/track/${track.id}?email=${email}`
    }))
  })
}
