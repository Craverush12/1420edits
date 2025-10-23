import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { amountInPaise, email, notes } = await req.json()

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    console.log("Razorpay Key ID exists:", !!keyId)
    console.log("Razorpay Key Secret exists:", !!keySecret)

    if (!keyId || !keySecret) {
      console.error("Missing Razorpay keys:", { keyId: !!keyId, keySecret: !!keySecret })
      return NextResponse.json({ error: "Missing Razorpay keys" }, { status: 500 })
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
    const resp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `desi_${Date.now()}`,
        notes: {
          ...notes,
          email,
        },
        payment_capture: 1,
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      console.error("Razorpay API error:", err)
      return NextResponse.json({ error: "Razorpay order failed", details: err }, { status: 500 })
    }
    const data = await resp.json()
    console.log("Razorpay order created successfully:", data.id)
    return NextResponse.json({ orderId: data.id, keyId })
  } catch (e) {
    console.error("Server error:", e)
    return NextResponse.json({ error: "Server error", details: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
