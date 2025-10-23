import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@/lib/supabase/server'
import { packs } from '@/data/packs'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")
  if (!email) return NextResponse.json({ items: [] })

  try {
    // Create Supabase client
    const supabase = await createServerClient()

    // Query orders from Supabase
    const { data, error } = await supabase
      .from('orders')
      .select('pack_id, created_at')
      .eq('email', email)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to query orders:', error)
      return NextResponse.json({ items: [] })
    }

    // Deduplicate pack IDs
    const uniquePackIds = [...new Set(data?.map(order => order.pack_id) || [])]

    // Build download items array
    const downloadItems = uniquePackIds
      .map(packId => {
        const packMetadata = packs.find(pack => pack.id === packId)
        if (!packMetadata) return null
        
        return {
          id: packId,
          title: packMetadata.title,
          url: `/packs/${packId}.zip`
        }
      })
      .filter(Boolean) // Remove null entries for invalid pack IDs

    return NextResponse.json({ items: downloadItems })

  } catch (error) {
    console.error('Downloads API error:', error)
    return NextResponse.json({ items: [] })
  }
}
