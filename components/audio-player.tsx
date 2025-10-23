"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AudioPlayerProps {
  src: string
  title: string
  className?: string
}

export function AudioPlayer({ src, title, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`audio-player-premium ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Track Title */}
      <div className="mb-2">
        <h4 className="text-xs font-bold text-gray-400 truncate uppercase tracking-wider">{title}</h4>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center gap-3 text-xs text-gray-300">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-transparent appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ff3366 0%, #ff3366 ${progress}%, #2a2a2a ${progress}%, #2a2a2a 100%)`
              }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={togglePlayPause}
            size="sm"
            className="w-9 h-9 bg-[#ff3366] hover:bg-[#ff1744] border border-[#ff3366]/50"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-black" />
            ) : (
              <Play className="w-3 h-3 text-black ml-0.5" />
            )}
          </Button>
          
          <Button
            onClick={toggleMute}
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 text-gray-500 hover:text-[#ff3366] hover:bg-[#2a2a2a]"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 w-20">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-transparent appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #ff3366 0%, #ff3366 ${(isMuted ? 0 : volume) * 100}%, #2a2a2a ${(isMuted ? 0 : volume) * 100}%, #2a2a2a 100%)`
            }}
          />
        </div>
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
          height: 20px;
          padding: 0;
          margin: 0;
        }
        
        input[type="range"]:focus {
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-track {
          height: 8px;
          border-radius: 0;
        }
        
        input[type="range"]::-moz-range-track {
          height: 8px;
          border-radius: 0;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #ff3366;
          cursor: grab;
          border: 2px solid rgba(255, 51, 102, 0.5);
          margin-top: -5px;
          position: relative;
          z-index: 10;
        }
        
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #ff3366;
          cursor: grab;
          border: 2px solid rgba(255, 51, 102, 0.5);
          position: relative;
          z-index: 10;
          border-radius: 0;
        }
        
        .slider:active::-webkit-slider-thumb {
          cursor: grabbing;
        }
        
        .slider:active::-moz-range-thumb {
          cursor: grabbing;
        }
        
        .slider:hover::-webkit-slider-thumb {
          background: #ff1744;
          box-shadow: 0 0 15px rgba(255, 51, 102, 0.6);
          transform: scale(1.1);
        }
        
        .slider:hover::-moz-range-thumb {
          background: #ff1744;
          box-shadow: 0 0 15px rgba(255, 51, 102, 0.6);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}
