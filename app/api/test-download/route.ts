import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  // Test 1: Check if track exists
  const { data: track, error: trackError } = await supabase
    .from('pack_downloads')
    .select('*')
    .eq('id', '84a391a5-6f31-4373-a9bd-9acd5cfcad28')
    .single()
  
  if (trackError) {
    return Response.json({ error: 'Track not found', details: trackError })
  }
  
  // Test 2: Check if user has access
  const { data: downloadLink, error: linkError } = await supabase
    .from('download_links')
    .select('*')
    .eq('user_email', '1032200160@tcetmumbai.in')
    .eq('pack_id', track.pack_id)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (linkError) {
    return Response.json({ error: 'No access', details: linkError })
  }
  
  // Test 3: Check if file exists in storage
  const { data: fileData, error: fileError } = await supabase.storage
    .from('downloads')
    .download(track.file_path)
  
  if (fileError) {
    return Response.json({ 
      error: 'File not found in storage', 
      filePath: track.file_path,
      details: fileError 
    })
  }
  
  return Response.json({ 
    success: true, 
    track: track,
    downloadLink: downloadLink,
    fileSize: fileData.size
  })
}
