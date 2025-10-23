"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { toast } from "sonner"

export default function DownloadsPage() {
  const [email, setEmail] = useState("")
  const [items, setItems] = useState<Array<{ id: string; title: string; url: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookup = async () => {
    // Clear previous error
    setError(null)
    
    // Email validation
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/downloads?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
        if (data.items && data.items.length > 0) {
          toast.success(`Found ${data.items.length} pack(s)!`)
        }
      } else {
        setError('Failed to fetch downloads. Please try again.')
        setItems([])
      }
    } catch (err) {
      setError('Failed to fetch downloads. Please try again.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh px-4 md:px-8 py-10">
      <div className="mx-auto max-w-3xl grid gap-6">
        <h1 className="text-3xl md:text-4xl font-bold text-balance">Your Downloads</h1>
        
        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input 
            placeholder="you@example.com" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            aria-label="Email address"
            disabled={loading}
          />
          <Button 
            onClick={lookup} 
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Searching...' : 'Find'}
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Purchased Packs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {items.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-2">
                  No purchases found for this email. After completing a purchase, your downloads will appear here.
                </p>
                <a href="/" className="text-primary underline text-sm">
                  Browse packs
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: If you purchased the same pack multiple times, it will appear once here.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3">
                {items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between p-3 rounded-md bg-gray-50 border hover:shadow-card transition-all duration-200">
                    <div className="flex flex-col">
                      <span className="font-medium">{it.title}</span>
                      <span className="text-xs text-gray-500">({it.id})</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={it.url} download className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
