import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }
    
    const supabase = await createClient()
  
    // Get track info
    const { data: track, error: trackError } = await supabase
      .from('pack_downloads')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (trackError || !track) {
      console.error('Track not found in DB:', trackError)
      return Response.json({ error: 'Track not found' }, { status: 404 })
    }
    
    console.log('Track found:', {
      id: track.id,
      pack_id: track.pack_id,
      file_path: track.file_path,
      track_title: track.track_title
    })
    
    // Verify user has access to this pack
    // Check for valid download link (either no expiry or expiry in future)
    const { data: downloadLinks, error: linkError } = await supabase
      .from('download_links')
      .select('*')
      .eq('user_email', email)
      .eq('pack_id', track.pack_id)
    
    if (linkError || !downloadLinks || downloadLinks.length === 0) {
      console.error('Access denied for email/pack:', email, track.pack_id, linkError)
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Check if any link is valid (expires_at is null OR expires_at is in the future)
    const now = new Date().toISOString()
    const validLink = downloadLinks.find(link => 
      !link.expires_at || link.expires_at > now
    )
    
    if (!validLink) {
      console.error('All download links expired for email/pack:', email, track.pack_id)
      return Response.json({ error: 'Download link expired' }, { status: 403 })
    }
    
    console.log('Access verified for:', email, 'pack:', track.pack_id)
    
    // Create admin client with service role key for storage access
    // This is needed because the anon key doesn't have storage read permissions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Serve the WAV file from Supabase Storage
    console.log('Attempting to download file from path:', track.file_path)
    const { data: fileData, error: fileError } = await adminClient.storage
      .from('downloads')
      .download(track.file_path)
    
    if (fileError) {
      console.error('Supabase Storage file error:', fileError)
      console.error('Error details:', {
        message: fileError.message,
        status: fileError.statusCode,
        filePath: track.file_path,
        bucket: 'downloads'
      })
      return Response.json({ 
        error: 'File not found', 
        details: fileError.message,
        filePath: track.file_path,
        hint: 'Check if the file exists in the downloads bucket at the specified path'
      }, { status: 404 })
    }
    
    console.log('File downloaded successfully, size:', fileData.size)
    
    // Convert blob to array buffer for response
    const arrayBuffer = await fileData.arrayBuffer()
    
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `attachment; filename="${track.track_title}.wav"`,
        'Content-Length': arrayBuffer.byteLength.toString()
      }
    })
  } catch (error: any) {
    console.error('Download API error:', error)
    return Response.json({ 
      error: 'Internal server error', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
