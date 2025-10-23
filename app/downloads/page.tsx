"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Music, HardDrive } from "lucide-react"
import { toast } from "sonner"

interface Track {
  id: string
  title: string
  format: string
  bitDepth: number
  sampleRate: number
  size: number
  downloadUrl: string
}

interface PackDownloads {
  packId: string
  tracks: Track[]
}

export default function DownloadsPage() {
  const [email, setEmail] = useState("")
  const [downloads, setDownloads] = useState<PackDownloads[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get email from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
      lookup(emailParam)
    }
  }, [])

  const lookup = async (emailToUse?: string) => {
    const emailAddress = emailToUse || email
    
    // Clear previous error
    setError(null)
    
    // Email validation
    if (!emailAddress.trim()) {
      setError('Please enter an email address')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/downloads?email=${encodeURIComponent(emailAddress)}`)
      if (res.ok) {
        const data = await res.json()
        setDownloads(data.packs || [])
        if (data.packs && data.packs.length > 0) {
          toast.success(`Found ${data.packs.length} pack(s) with ${data.packs.reduce((total: number, pack: PackDownloads) => total + pack.tracks.length, 0)} tracks!`)
        }
      } else {
        setError('Failed to fetch downloads. Please try again.')
        setDownloads([])
      }
    } catch (err) {
      setError('Failed to fetch downloads. Please try again.')
      setDownloads([])
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#151515] flex items-center justify-center border-2 border-[#2a2a2a] rounded-lg">
            <Music className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Loading Downloads</h3>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    )
  }

  if (downloads.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#151515] flex items-center justify-center border-2 border-[#2a2a2a] rounded-lg">
            <Music className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Downloads Available</h3>
          <p className="text-gray-500 mb-4">Complete a purchase to access your downloads.</p>
          <a href="/" className="text-[#ff3366] underline text-sm">
            Browse Packs
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gradient mb-2">Your Downloads</h1>
          <p className="text-gray-500">High-quality WAV files ready for download</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-3 mb-6">
            {error}
          </div>
        )}

        {/* Email lookup form */}
        <div className="flex gap-2 mb-8">
          <Input 
            placeholder="you@example.com" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            aria-label="Email address"
            disabled={loading}
            className="bg-[#151515] border-[#2a2a2a] text-white"
          />
          <Button 
            onClick={() => lookup()} 
            disabled={loading}
            className="bg-gradient-to-r from-[#ff3366] to-[#ff1744] hover:from-[#ff1744] hover:to-[#ff3366]"
          >
            {loading ? 'Searching...' : 'Find Downloads'}
          </Button>
        </div>

        {downloads.map((pack) => (
          <Card key={pack.packId} className="mb-6 bg-[#151515] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Desi Bass Edits {pack.packId.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pack.tracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#ff3366] to-[#ff1744] flex items-center justify-center rounded-lg">
                        <Music className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{track.title}</h4>
                        <p className="text-sm text-gray-400">
                          {track.format} • {track.bitDepth}-bit • {track.sampleRate}kHz • {formatFileSize(track.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.open(track.downloadUrl, '_blank')}
                      className="bg-gradient-to-r from-[#ff3366] to-[#ff1744] hover:from-[#ff1744] hover:to-[#ff3366]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
