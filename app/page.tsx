"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/cart-context"
import { CartDrawer } from "@/components/cart-drawer"
import { AudioPlayer } from "@/components/audio-player"
import { packs, packSamples } from "@/data/packs"
import { ShoppingCart, Music, Zap, Star, Play } from "lucide-react"

const PRICES_INR = {
  single: 499,
  bundle2: 899,
  bundle3: 1299,
  bundle5: 2199,
}

function useStock(id: string) {
  const { data, isLoading, mutate } = useSWR<{ left: number }>(
    `/api/stock?packId=${id}`,
    (url) => fetch(url).then((r) => r.json()),
    { refreshInterval: 5000 },
  )
  return { stock: data?.left ?? 996, isLoading, mutate }
}

function EmailCapture({
  trigger,
  onSubmit,
}: {
  trigger: React.ReactNode
  onSubmit: (email: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
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
      if (!res.ok) {
        console.log("[v0] subscribe failed")
      }
      await onSubmit(email)
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-balance">Enter your email to continue</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          We&apos;ll send your download link here and keep a Downloads page for easy access.
        </p>
      </DialogContent>
    </Dialog>
  )
}

function BundlesSection({ onSelect }: { onSelect: (size: 2 | 3 | 5) => void }) {
  const bundles = [
    { 
      size: 2 as const, 
      title: "Duo Pack", 
      subtitle: "Bundle of 2",
      price: PRICES_INR.bundle2, 
      desc: "Pick any 2 volumes",
      savings: "Save ₹99",
      gradient: "from-blue-500 to-cyan-500",
      icon: Music
    },
    { 
      size: 3 as const, 
      title: "Triple Pack", 
      subtitle: "Bundle of 3",
      price: PRICES_INR.bundle3, 
      desc: "Pick any 3 volumes",
      savings: "Save ₹198",
      gradient: "from-purple-500 to-pink-500",
      icon: Zap
    },
    { 
      size: 5 as const, 
      title: "Complete Pack", 
      subtitle: "Bundle of 5",
      price: PRICES_INR.bundle5, 
      desc: "Pick all 5 volumes",
      savings: "Save ₹296",
      gradient: "from-orange-500 to-red-500",
      icon: Star
    },
  ]
  
  return (
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <h3 className="text-5xl font-black text-gradient uppercase tracking-tighter">Bundle Deals</h3>
        <p className="text-gray-500 text-lg uppercase tracking-wider">MORE TRACKS. MORE SAVINGS.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {bundles.map((b, index) => {
          const Icon = b.icon
          return (
            <Card 
              key={b.size} 
              className="group relative overflow-hidden bg-[#151515] border-2 border-[#2a2a2a] shadow-soft transition-all duration-300 hover:shadow-glow hover:border-[#ff3366] animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Grunge Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 11px)'
                }}></div>
              </div>
              
              <CardContent className="relative p-5 text-center space-y-6 shadow-card">
                {/* Icon */}
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#ff3366] to-[#ff1744] flex items-center justify-center shadow-glow">
                  <Icon className="w-6 h-6 text-black" />
                </div>
                
                {/* Title & Subtitle */}
                <div className="space-y-1.5">
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">{b.title}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{b.subtitle}</p>
                </div>
                
                {/* Description */}
                <p className="text-gray-400 text-sm">{b.desc}</p>
                
                {/* Price */}
                <div className="space-y-2">
                  <div className="text-3xl font-black text-gradient">₹{b.price}</div>
                  <div className="inline-flex items-center px-3 py-1 bg-[#ff3366]/20 text-[#ff3366] text-xs font-bold uppercase tracking-wider border border-[#ff3366]/30">
                    {b.savings}
                  </div>
                </div>
                
                {/* CTA Button */}
                <Button 
                  onClick={() => onSelect(b.size)}
                  className="w-full h-10 font-bold text-sm btn-premium"
                >
                  Select {b.size} Volumes
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PackCard({ id, title, coverImage }: { id: string; title: string; coverImage: string }) {
  const { stock, isLoading } = useStock(id)
  const { addPack, items } = useCart()
  const inCart = items.some((i) => i.id === id)
  const samples = packSamples[id as keyof typeof packSamples] || []
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-[#151515] border-2 border-[#2a2a2a] shadow-soft transition-all duration-500 hover:shadow-glow hover:border-[#ff3366]",
        inCart && "border-[#ff3366] shadow-glow"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Grunge Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, #fff 10px, #fff 11px)'
        }}></div>
      </div>
      
      <CardContent className="relative p-4 space-y-5 shadow-card">
        {/* Cover Image with Grunge Effects */}
        <div className="relative aspect-square w-full overflow-hidden bg-black">
          <Image
            src={coverImage}
            alt={`${title} artwork`}
            width={800}
            height={800}
            className={cn(
              "h-full w-full object-cover transition-all duration-500 grayscale-[30%]",
              isHovered && "scale-110 grayscale-0"
            )}
          />
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Play Button Overlay */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300",
            isHovered && "opacity-100"
          )}>
            <div className="w-16 h-16 bg-[#ff3366] flex items-center justify-center shadow-glow border-2 border-[#ff3366]/50">
              <Play className="w-6 h-6 text-black ml-1" fill="black" />
            </div>
          </div>
        </div>

        {/* Audio Players */}
        <div className="space-y-2">
          {samples.map((s: { title: string; url: string }, idx: number) => (
            <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <AudioPlayer src={s.url} title={s.title} />
            </div>
          ))}
        </div>

        {/* Price & Stock Info */}
        <div className="flex items-center justify-between pt-1.5 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#ff3366] fill-current" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">LIMITED</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-gradient">₹{PRICES_INR.single}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">{isLoading ? "..." : `${stock} LEFT`}</div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={() => addPack({ id, title })}
          disabled={inCart}
          className={cn(
            "w-full h-10 font-bold text-sm transition-all duration-300",
            inCart 
              ? "bg-[#1a1a1a] text-[#ff3366] border-2 border-[#ff3366] shadow-glow" 
              : "btn-premium"
          )}
        >
          {inCart ? (
            <div className="flex items-center gap-2 uppercase tracking-wider">
              <ShoppingCart className="w-5 h-5" />
              In Cart
            </div>
          ) : (
            <div className="flex items-center gap-2 uppercase tracking-wider">
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const { selectedBundle, setSelectedBundle, items } = useCart()
  const packsRef = useRef<HTMLDivElement | null>(null)

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Grunge Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-[#2a2a2a]">
        <div className="mx-auto max-w-7xl px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ff3366] to-[#ff1744] flex items-center justify-center shadow-glow">
                <Music className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient tracking-tight">14.20</h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Desi Bass Edits</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-4">
              <a 
                href="/downloads" 
                className="text-gray-400 hover:text-[#ff3366] font-medium transition-colors duration-200 uppercase text-xs tracking-wider"
              >
                Downloads
              </a>
              <CartDrawer />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Grunge */}
      <section className="relative overflow-hidden border-b border-[#2a2a2a]">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff3366]/5 via-black to-black" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff3366]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff1744]/10 rounded-full blur-3xl" />
        
        {/* Scanlines effect */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)'
          }}></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h2 className="text-6xl md:text-8xl font-black text-gradient leading-none tracking-tighter uppercase">
                DESI BASS
              </h2>
              <h3 className="text-2xl md:text-4xl font-bold text-gray-300 uppercase tracking-wider">
                Brass Hits <span className="text-[#ff3366]">×</span> Urban Bass
              </h3>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Underground Bollywood edits with crushing bass drops. 
                Made for DJs who don't play by the rules.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button 
                onClick={() => packsRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="btn-premium text-base px-10 py-3"
              >
                Explore Packs
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-[#2a2a2a] text-gray-400 hover:border-[#ff3366] hover:text-[#ff3366] text-base px-10 py-3 bg-transparent uppercase tracking-wider"
              >
                Listen
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section className="py-16 bg-[#0a0a0a] border-b border-[#2a2a2a]">
        <div className="mx-auto max-w-7xl px-6">
          <BundlesSection
            onSelect={(size) => {
              setSelectedBundle(size)
              if (packsRef.current) packsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
            }}
          />
        </div>
      </section>

      {/* Bundle Selection Indicator */}
      {selectedBundle && (
        <div className="mx-auto max-w-7xl px-6 mb-8">
          <div className="bg-[#151515] border-2 border-[#ff3366] p-4 animate-scale-in shadow-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#ff3366] flex items-center justify-center">
                  <Star className="w-3 h-3 text-black fill-current" />
                </div>
                <div>
                  <h4 className="font-black text-white uppercase tracking-tight">Bundle of {selectedBundle} Selected</h4>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">
                    Select {selectedBundle} pack{selectedBundle === 2 ? "s" : "s"} to unlock discount. 
                    Currently {items.length}/{selectedBundle} selected.
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => setSelectedBundle(null)}
                className="border-2 border-[#2a2a2a] text-gray-400 hover:border-[#ff3366] hover:text-[#ff3366] uppercase text-xs tracking-wider"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <section ref={packsRef} id="packs-section" className="py-16 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-black text-gradient mb-4 uppercase tracking-tighter">Full Collection</h3>
            <p className="text-lg text-gray-500 uppercase tracking-wider">HANDPICKED EDITS FOR THE UNDERGROUND</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((p, index) => (
              <div 
                key={p.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PackCard id={p.id} title={p.title} coverImage={p.coverImage} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grunge Footer */}
      <footer className="bg-black text-gray-400 py-16 border-t-2 border-[#2a2a2a]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ff3366] to-[#ff1744] flex items-center justify-center shadow-glow">
                  <Music className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-white uppercase tracking-tight">14.20</h4>
                  <p className="text-xs text-gray-600 uppercase tracking-widest">Desi Bass Edits</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Underground Bollywood edits with crushing bass drops. Made for the streets, played in the clubs.
              </p>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-black uppercase tracking-wider text-white">Links</h5>
              <div className="space-y-2">
                <a href="/downloads" className="block text-gray-600 hover:text-[#ff3366] transition-colors uppercase text-sm tracking-wider">Downloads</a>
                <a href="#" className="block text-gray-600 hover:text-[#ff3366] transition-colors uppercase text-sm tracking-wider">Support</a>
                <a href="#" className="block text-gray-600 hover:text-[#ff3366] transition-colors uppercase text-sm tracking-wider">License</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-black uppercase tracking-wider text-white">Contact</h5>
              <div className="space-y-2 text-gray-600 text-sm">
                <p className="uppercase tracking-wider">support@14-20.com</p>
                <p className="uppercase tracking-wider">Follow for drops</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#2a2a2a] mt-12 pt-8 text-center text-gray-700">
            <p className="text-xs uppercase tracking-widest">© {new Date().getFullYear()} 14.20 — DESI BASS EDITS. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
