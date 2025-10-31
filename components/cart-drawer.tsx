"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "./cart-context"
import { useRouter } from "next/navigation" // import router to redirect to downloads post-payment
import { ShoppingCart, X, CheckCircle, Music, ArrowRight } from "lucide-react"
import { toast } from "sonner"

function EmailCapture({
  onSubmit,
}: {
  onSubmit: (email: string) => Promise<void>
}) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) console.log("[v0] subscribe failed")
      await onSubmit(email)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <input
          className="w-full h-12 rounded-lg border-2 border-[#2a2a2a] bg-[#151515] text-white px-4 text-sm focus:border-[#ff3366] focus:ring-2 focus:ring-[#ff3366]/20 transition-all duration-200"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <Button 
          onClick={submit} 
          disabled={loading}
          className="w-full h-12 btn-premium text-sm"
        >
          {loading ? "Processing..." : "Continue to Pay"}
        </Button>
      </div>
      <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
        We&apos;ll send your downloads to this email and save them on the Downloads page.
      </p>
    </div>
  )
}

async function ensureRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return
  if ((window as any).Razorpay) return
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Failed to load Razorpay"))
    document.body.appendChild(s)
  })
}

export function CartDrawer() {
  const { items, removePack, clear, count, totalInInr, selectedBundle, setSelectedBundle } = useCart()
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showEmail, setShowEmail] = useState(false) // only ask email after clicking Checkout
  const router = useRouter() //

  const handleBundleSelection = (bundleSize: 2 | 3 | 5) => {
    setSelectedBundle(bundleSize)
    setOpen(false) // Close the cart drawer
    
    // Show notification based on current count
    const packsNeeded = bundleSize - count
    if (packsNeeded > 0) {
      toast.success(`Bundle of ${bundleSize} selected! Add ${packsNeeded} more pack${packsNeeded > 1 ? 's' : ''} to get the discount.`, {
        duration: 5000,
      })
    } else {
      toast.success(`Bundle of ${bundleSize} selected! Discount applied.`, {
        duration: 3000,
      })
    }
    
    // Scroll to packs section
    setTimeout(() => {
      const packsSection = document.getElementById('packs-section')
      if (packsSection) {
        packsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 500)
  }

  async function checkout(email: string) {
    try {
      setProcessing(true)
      await ensureRazorpayScript()

      const notes = {
        packIds: items.map((i) => i.id).join(","),
        titles: items.map((i) => i.title).join(","),
      }

      const create = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInPaise: totalInInr * 100,
          notes,
          email,
        }),
      })
      if (!create.ok) {
        alert("Checkout not ready. Please check Razorpay keys in Vars.")
        return
      }
      const { orderId, keyId } = await create.json()

      const rz = new (window as any).Razorpay({
        key: keyId,
        amount: totalInInr * 100,
        currency: "INR",
        name: "14.20's Desi Bass Edits",
        description: `${count} pack(s) purchase`,
        order_id: orderId,
        prefill: { email },
        notes,
        theme: { color: "#0ea5a3" },
        handler: async (response) => {
          try {
            // Update stock for each pack
            await Promise.all(
              items.map((i) =>
                fetch("/api/stock", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ packId: i.id, delta: -1 }),
                }),
              ),
            )

            // Store order in database
            try {
              const orderResponse = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email,
                  packIds: items.map(i => i.id),
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  totalAmountInPaise: totalInInr * 100,
                  razorpaySignature: response.razorpay_signature
                }),
              })

              if (orderResponse.ok) {
                toast.success('Order confirmed! Check your email for download links.')
              } else {
                console.error('Failed to store order:', await orderResponse.text())
                toast.warning('Payment successful but order recording failed. Contact support with your payment ID.')
              }
            } catch (orderError) {
              console.error('Order storage error:', orderError)
              toast.warning('Payment successful but order recording failed. Contact support with your payment ID.')
            }
          } catch (error) {
            console.error('Payment processing error:', error)
          }
          
          clear()
          setOpen(false)
          router.push("/downloads") // go to downloads after payment
        },
      })
      rz.open()
    } catch (e) {
      console.log("[v0] razorpay error", e)
      alert("Something went wrong. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="relative border-2 border-[#2a2a2a] hover:border-[#ff3366] hover:shadow-glow transition-all duration-200 px-6 py-3 uppercase tracking-wider text-xs"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold">Cart</span>
            {count > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff3366] flex items-center justify-center text-black text-xs font-bold animate-scale-in border border-[#ff3366]/50">
                {count}
              </div>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-[#0a0a0a] border-l-2 border-[#2a2a2a] flex flex-col px-6">
        <SheetHeader className="pb-6 border-b border-[#2a2a2a] mb-6 -mx-6 px-6">
          <SheetTitle className="text-2xl font-black text-gradient flex items-center gap-2 uppercase tracking-tight">
            <ShoppingCart className="w-6 h-6" />
            Your Cart
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto -mx-6 px-6">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 mx-auto mb-6 bg-[#151515] flex items-center justify-center border-2 border-[#2a2a2a] rounded-lg">
                <Music className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Cart Empty</h3>
              <p className="text-gray-500 text-sm uppercase tracking-wider">Add tracks to start</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Cart Items</h3>
                {items.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-4 rounded-lg bg-[#151515] border-2 border-[#2a2a2a] shadow-soft hover:border-[#ff3366] hover:shadow-card transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#ff3366] to-[#ff1744] flex items-center justify-center rounded-lg">
                        <Music className="w-4 h-4 text-black" />
                      </div>
                      <div className="text-sm font-bold text-white uppercase tracking-tight flex-1">{i.title}</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removePack(i.id)}
                      className="text-gray-500 hover:text-[#ff3366] hover:bg-[#2a2a2a] ml-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator className="my-8" />
              
              {/* Bundle Selection - Only show if user has items but no bundle selected or incomplete bundle */}
              {count > 0 && (!selectedBundle || count < selectedBundle) && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Upgrade to Bundle</h3>
                  <div className="grid gap-2">
                    <button
                      onClick={() => handleBundleSelection(2)}
                      className="p-4 rounded-lg border-2 border-[#2a2a2a] bg-[#151515] hover:border-[#ff3366]/50 hover:shadow-card-hover transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">Bundle of 2</div>
                          <div className="text-xs text-gray-400">Save ₹99</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-black text-gradient">₹899</div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#ff3366] transition-colors" />
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleBundleSelection(3)}
                      className="p-4 rounded-lg border-2 border-[#2a2a2a] bg-[#151515] hover:border-[#ff3366]/50 hover:shadow-card-hover transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">Bundle of 3</div>
                          <div className="text-xs text-gray-400">Save ₹198</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-black text-gradient">₹1,299</div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#ff3366] transition-colors" />
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleBundleSelection(5)}
                      className="p-4 rounded-lg border-2 border-[#2a2a2a] bg-[#151515] hover:border-[#ff3366]/50 hover:shadow-card-hover transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">Bundle of 5</div>
                          <div className="text-xs text-gray-400">Save ₹296</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-black text-gradient">₹2,199</div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#ff3366] transition-colors" />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              
              <Separator className="my-8" />
              
              {/* Price Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Price Breakdown</h3>
                
                {/* Individual Items */}
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-2 px-3 bg-[#151515] rounded-lg border border-[#2a2a2a]">
                      <span className="text-gray-300 font-medium">{item.title}</span>
                      <span className="text-white font-bold">₹499</span>
                    </div>
                  ))}
                </div>
                
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm border-t-2 border-[#2a2a2a] pt-4 bg-[#151515] p-3 rounded-lg">
                  <span className="text-gray-300 font-medium">Subtotal ({count} items)</span>
                  <span className="text-white font-bold text-lg">₹{count * 499}</span>
                </div>
                
                {/* Bundle Discount - Only show when bundle is complete */}
                {selectedBundle && count === selectedBundle && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-400 font-medium">
                        Bundle Discount ({selectedBundle} pack{selectedBundle > 1 ? 's' : ''})
                      </span>
                      <span className="text-green-400 font-bold">
                        -₹{count * 499 - totalInInr}
                      </span>
                    </div>
                    
                    {/* Show discounted total prominently */}
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">Bundle Price</span>
                        </div>
                        <span className="text-green-400 text-lg font-bold">₹{totalInInr}</span>
                      </div>
                      <div className="text-xs text-green-300 mt-1">
                        You saved ₹{count * 499 - totalInInr}!
                      </div>
                    </div>
                  </>
                )}
                
                {/* Regular Total - Only show if no bundle or incomplete bundle */}
                {(!selectedBundle || count !== selectedBundle) && (
                  <div className="flex items-center justify-between text-lg border-t-2 border-[#ff3366] pt-4 bg-gradient-to-r from-[#ff3366]/10 to-[#ff1744]/10 p-4 rounded-lg">
                    <span className="font-bold text-white uppercase tracking-wider">Total</span>
                    <span className="text-3xl font-black text-gradient">₹{totalInInr}</span>
                  </div>
                )}
              </div>
              
              <Separator className="my-8" />
              
              {/* Checkout Section */}
              <div className="space-y-4 pb-6">
                {!showEmail ? (
                  <Button 
                    onClick={() => setShowEmail(true)} 
                    disabled={processing}
                    className="w-full h-10 btn-premium text-sm"
                  >
                    {processing ? "Processing..." : "Checkout"}
                  </Button>
                ) : (
                  <EmailCapture onSubmit={checkout} />
                )}
                
                <Button 
                  variant="outline" 
                  onClick={clear} 
                  disabled={processing}
                  className="w-full border-2 border-[#2a2a2a] text-gray-400 hover:border-[#ff3366] hover:text-[#ff3366] uppercase text-xs tracking-wider"
                >
                  Clear Cart
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
