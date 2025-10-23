import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return Response.json({ error: 'Email required' }, { status: 400 })
  }
  
  const supabase = createClient()
  
  // Get track info
  const { data: track, error: trackError } = await supabase
    .from('pack_downloads')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (trackError || !track) {
    return Response.json({ error: 'Track not found' }, { status: 404 })
  }
  
  // Verify user has access to this pack
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('email', email)
    .contains('pack_ids', [track.pack_id])
    .single()
  
  if (!order) {
    return Response.json({ error: 'Access denied' }, { status: 403 })
  }
  
  // Serve the WAV file from Supabase Storage
  const { data: fileData, error: fileError } = await supabase.storage
    .from('downloads')
    .download(track.file_path)
  
  if (fileError) {
    return Response.json({ error: 'File not found' }, { status: 404 })
  }
  
  return new Response(fileData, {
    headers: {
      'Content-Type': 'audio/wav',
      'Content-Disposition': `attachment; filename="${track.track_title}.wav"`,
      'Content-Length': track.file_size.toString()
    }
  })
}
