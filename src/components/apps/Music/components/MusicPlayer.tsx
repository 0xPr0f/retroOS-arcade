import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  Repeat,
  Plus,
} from 'lucide-react'
import { lightBlue, lightRed } from '@/components/pc/drives/Extensions/colors'

const AudioVisualizer = () => {
  const [audioData, setAudioData] = useState<number[]>(new Array(20).fill(0))
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    const audioElement = document.querySelector('audio')
    if (!audioElement) return

    const initializeAudio = async () => {
      if (isInitializedRef.current) return

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext()
          await audioContextRef.current.resume()
        }

        if (!analyserRef.current) {
          analyserRef.current = audioContextRef.current.createAnalyser()
        }

        if (!sourceRef.current) {
          sourceRef.current =
            audioContextRef.current.createMediaElementSource(audioElement)
          sourceRef.current.connect(analyserRef.current)
          analyserRef.current.connect(audioContextRef.current.destination)
          isInitializedRef.current = true
        }

        analyserRef.current.fftSize = 64
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const updateData = () => {
          if (!analyserRef.current) return
          analyserRef.current.getByteFrequencyData(dataArray)

          // Get 20 samples from the frequency data
          const samples = new Array(20).fill(0).map((_, i) => {
            const index = Math.floor(i * (bufferLength / 20))
            return dataArray[index]
          })

          setAudioData(samples)
          rafRef.current = requestAnimationFrame(updateData)
        }

        updateData()
      } catch (err) {
        console.error('Error initializing audio:', err)
      }
    }

    const handleClick = () => {
      initializeAudio()
    }

    document.addEventListener('click', handleClick, { once: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        audioContextRef.current.close()
      }
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <div className="h-24 bg-zinc-800/50 rounded-lg mb-4 flex items-center justify-center mt-3 p-4">
      <div className="flex items-end justify-center gap-1 h-full w-full">
        {audioData.map((height, i) => (
          <div
            key={i}
            className="w-1 rounded-full"
            style={{
              height: `${height / 2.5}%`,
              background: `linear-gradient(to top, ${lightBlue}, ${lightRed})`,
              transition: 'height 0.1s ease-in-out',
            }}
          />
        ))}
      </div>
    </div>
  )
}

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [volume, setVolume] = useState(50)
  const [currentTime, setCurrentTime] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(0) // 0: no repeat, 1: repeat all, 2: repeat one
  const [showPlaylist, setShowPlaylist] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  const tracks = [
    {
      title: 'No More Continues',
      artist: 'meloyaryesgriffiths',
      duration: 277,
      genre: 'Chiptune',
      cover: 'Arcade',
      color: `from-[${lightBlue}] to-[${lightRed}]`,
      audio: '/assets/audio/meloyaryesgriffiths.mp3',
    },
    {
      title: 'Hiphop Rap Beat',
      artist: 'genxbeats',
      duration: 211,
      genre: 'Hiphop',
      cover: 'Cool',
      color: `from-[${lightBlue}] to-[${lightRed}]`,
      audio: '/assets/audio/genxbeats.mp3',
    },
    {
      title: 'Bass and Strings',
      artist: 'cyberwave-orchestra',
      duration: 124,
      genre: 'Strings',
      cover: 'Bass',
      color: `from-[${lightBlue}] to-[${lightRed}]`,
      audio: '/assets/audio/cyberwave-orchestra.mp3',
    },
    {
      title: 'WatR - Double Overhead',
      artist: 'itswatr',
      duration: 210,
      genre: 'Dubstep',
      cover: 'Watr',
      color: `from-[${lightBlue}] to-[${lightRed}]`,
      audio: '/assets/audio/itswatr.mp3',
    },
    {
      title: 'Lofi Cozy Chill',
      artist: 'Lofi Girl',
      duration: 147,
      genre: 'Lofi',
      cover: 'Lofi',
      color: `from-[${lightBlue}] to-[${lightRed}]`,
      audio: '/assets/audio/lofi-chill.mp3',
    },
    {
      title: 'Lofi Cozy Relax',
      artist: 'Lofi Girl',
      duration: 148,
      genre: 'Lofi',
      cover: 'Relax',
      color: `from-[${lightBlue}] to-[${lightRed}]`,
      audio: '/assets/audio/lofi-relax.mp3',
    },
  ]

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = tracks[currentTrack].audio
      audioRef.current.load()
      if (isPlaying) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Error playing audio:', error)
          })
        }
      }
    }
  }, [currentTrack])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Error playing audio:', error)
            setIsPlaying(false)
          })
        }
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime))
    }
  }

  const handleTrackEnd = () => {
    if (repeat === 2) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Error playing audio:', error)
          })
        }
      }
    } else if (repeat === 1) {
      handleNext()
    } else if (shuffle) {
      const nextTrack = Math.floor(Math.random() * tracks.length)
      setCurrentTrack(nextTrack)
    } else {
      handleNext()
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (shuffle) {
      const nextTrack = Math.floor(Math.random() * tracks.length)
      setCurrentTrack(nextTrack)
    } else {
      setCurrentTrack((prev) => (prev + 1) % tracks.length)
    }
  }

  const handlePrevious = () => {
    if (currentTime > 5) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
    } else {
      if (shuffle) {
        const prevTrack = Math.floor(Math.random() * tracks.length)
        setCurrentTrack(prevTrack)
      } else {
        setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length)
      }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    const newTime = Math.floor(percent * tracks[currentTrack].duration)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX />
    if (volume < 50) return <Volume1 />
    return <Volume2 />
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-zinc-900  shadow-xl p-4 text-white">
      <AudioVisualizer />

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-1">
            {tracks[currentTrack].title}
          </h2>
          <p className="text-sm text-zinc-400">{tracks[currentTrack].artist}</p>
        </div>
        <div
          className={`w-12 h-12 bg-gradient-to-br ${tracks[currentTrack].color} rounded-lg flex items-center justify-center`}
        >
          <span className="text-xl">
            {tracks[currentTrack].cover[0].toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div
          className="h-1.5 bg-zinc-800 rounded-full mb-1 cursor-pointer relative group"
          onClick={handleSeek}
        >
          <div
            className="h-1.5 rounded-full relative"
            style={{
              width: `${(currentTime / tracks[currentTrack].duration) * 100}%`,
              background: `linear-gradient(to right, ${lightBlue}, ${lightRed})`,
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(tracks[currentTrack].duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          className={`p-1.5 hover:bg-zinc-800 rounded-full ${
            shuffle ? `text-[${lightBlue}]` : ''
          }`}
          onClick={() => setShuffle(!shuffle)}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          className="p-1.5 hover:bg-zinc-800 rounded-full"
          onClick={handlePrevious}
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          className="p-3 rounded-full hover:opacity-90"
          style={{
            background: `linear-gradient(to right, ${lightBlue}, ${lightRed})`,
          }}
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <button
          className="p-1.5 hover:bg-zinc-800 rounded-full"
          onClick={handleNext}
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            className={`p-1.5 hover:bg-zinc-800 rounded-full ${
              repeat ? `text-[${lightBlue}]` : ''
            }`}
            onClick={() => setRepeat((prev) => (prev + 1) % 3)}
          >
            <Repeat className="w-4 h-4" />
            {repeat === 2 && (
              <span
                className="absolute -top-1 -right-1 text-xs rounded-full w-3 h-3 flex items-center justify-center text-[10px]"
                style={{ background: lightBlue }}
              >
                1
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button className="p-1.5 hover:bg-zinc-800 rounded-full">
          {getVolumeIcon()}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full"
          style={{
            WebkitAppearance: 'none',
          }}
        />
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Playlist</h3>
        <button
          className="p-1.5 hover:bg-zinc-800 rounded-full"
          onClick={() => setShowPlaylist(!showPlaylist)}
        >
          <Plus
            className={`w-4 h-4 transform transition-transform ${
              showPlaylist ? 'rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {showPlaylist && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {tracks.map((track, index) => (
            <div
              key={index}
              className={`flex items-center p-2 rounded-lg cursor-pointer text-sm ${
                currentTrack === index ? 'bg-zinc-800' : 'hover:bg-zinc-800'
              }`}
              onClick={() => {
                setCurrentTrack(index)
                setCurrentTime(0)
                setIsPlaying(true)
              }}
            >
              <div
                className={`w-8 h-8 bg-gradient-to-br ${track.color} rounded flex items-center justify-center mr-2`}
              >
                <span>{track.cover[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{track.title}</h4>
                <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
              </div>
              <span className="text-xs text-zinc-400 ml-2">
                {formatTime(track.duration)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MusicPlayer
