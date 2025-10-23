import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const packId = req.nextUrl.searchParams.get("packId") || "vol-1"
  
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('packs')
      .select('stock_left')
      .eq('id', packId)
      .single()
    
    if (error || !data) {
      // Pack not found or database error - return fallback value
      console.error('Error fetching stock:', error)
      return NextResponse.json({ left: 996 })
    }
    
    return NextResponse.json({ left: data.stock_left })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ left: 996 })
  }
}

export async function POST(req: NextRequest) {
  const { packId, delta } = await req.json().catch(() => ({}))
  if (!packId || typeof delta !== "number") return NextResponse.json({ ok: false }, { status: 400 })
  
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.rpc('update_pack_stock', {
      pack_id: packId,
      stock_delta: delta
    })
    
    if (error) {
      console.error('Error updating stock:', error)
      return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 })
    }
    
    // If data is 0, it means the pack was not found
    if (data === 0) {
      return NextResponse.json({ ok: false, error: 'Pack not found' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true, left: data })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 })
  }
}
