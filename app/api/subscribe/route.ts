import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const supabase = createServerClient()
    // if env vars are not set, handle gracefully
    if (!supabase) return NextResponse.json({ ok: true, skipped: true })

    const { error } = await supabase.from("emails").insert({ email })
    if (error) {
      // ignore duplicates
      if (!String(error.message).toLowerCase().includes("duplicate")) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
