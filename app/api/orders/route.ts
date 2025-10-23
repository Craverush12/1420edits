import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, packIds, razorpayOrderId, razorpayPaymentId, totalAmountInPaise, razorpaySignature } = body

    // Validate required fields
    if (!email || !packIds || !razorpayOrderId || !razorpayPaymentId || !totalAmountInPaise) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate packIds is array and not empty
    if (!Array.isArray(packIds) || packIds.length === 0) {
      return NextResponse.json(
        { error: 'packIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // Calculate per-pack amount (integer division)
    const amountPerPack = Math.floor(totalAmountInPaise / packIds.length)

    // Create Supabase client
    const supabase = await createServerClient()

    // Prepare orders array for batch insert
    const ordersArray = packIds.map(packId => ({
      email,
      pack_id: packId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      amount_in_paise: amountPerPack,
      status: 'completed'
    }))

    // Insert orders into database
    const { error } = await supabase
      .from('orders')
      .insert(ordersArray)

    if (error) {
      console.error('Failed to store orders:', error)
      return NextResponse.json(
        { error: 'Failed to store orders' },
        { status: 500 }
      )
    }

    // Generate download links for the purchased packs
    const downloadLinks = packIds.map(packId => ({
      user_email: email,
      pack_id: packId
    }))

    // Store download access in database
    const { error: downloadError } = await supabase
      .from('download_links')
      .insert(downloadLinks)

    if (downloadError) {
      console.error('Failed to create download links:', downloadError)
      // Don't fail the order, just log the error
    }

    return NextResponse.json({
      success: true,
      orderCount: packIds.length
    })

  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
