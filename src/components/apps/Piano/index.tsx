import React, { useState, useEffect } from 'react'
import VirtualPiano from './components/Player'
import './piano.css'
import { SplendidGrandPiano, Soundfont } from 'smplr'

interface PianoKey {
  id: string
  type: 'white' | 'black'
  note: string
}

const PianoTest: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [piano, setPiano] = useState<SplendidGrandPiano | null>(null)

  // Piano keys configuration
  const keys: PianoKey[] = [
    // White keys (mapped to alphabets for easy typing)
    { id: 'Q', type: 'white', note: 'C4' },
    { id: 'W', type: 'white', note: 'D4' },
    { id: 'E', type: 'white', note: 'E4' },
    { id: 'R', type: 'white', note: 'F4' },
    { id: 'T', type: 'white', note: 'G4' },
    { id: 'Y', type: 'white', note: 'A4' },
    { id: 'U', type: 'white', note: 'B4' },
    { id: 'I', type: 'white', note: 'C5' },
    { id: 'O', type: 'white', note: 'D5' },
    { id: 'P', type: 'white', note: 'E5' },
    { id: 'Z', type: 'white', note: 'F5' },
    { id: 'X', type: 'white', note: 'G5' },
    { id: 'C', type: 'white', note: 'A5' },
    { id: 'V', type: 'white', note: 'B5' },
    { id: 'B', type: 'white', note: 'C6' },
    { id: 'N', type: 'white', note: 'D6' },
    { id: 'M', type: 'white', note: 'E6' },

    // Black keys (mapped to numbers and symbols for easy typing)
    { id: '1', type: 'black', note: 'C#4' },
    { id: '2', type: 'black', note: 'D#4' },
    { id: '3', type: 'black', note: 'F#4' },
    { id: '4', type: 'black', note: 'G#4' },
    { id: '5', type: 'black', note: 'A#4' },
    { id: '6', type: 'black', note: 'C#5' },
    { id: '7', type: 'black', note: 'D#5' },
    { id: '8', type: 'black', note: 'F#5' },
    { id: '9', type: 'black', note: 'G#5' },
    { id: '0', type: 'black', note: 'A#5' },
    { id: '/', type: 'black', note: 'C#6' },
    { id: '=', type: 'black', note: 'D#6' },
  ]

  // Initialize Smplr piano
  useEffect(() => {
    const audioContext = new AudioContext()
    const smplrPiano = new SplendidGrandPiano(audioContext, {
      //  instrument: 'acoustic_grand_piano', // Use a high-quality piano soundfont
      /* onLoaded: () => {
        setPiano(smplrPiano);
      } */
    })
    smplrPiano.load.then(() => {
      // now the piano is fully loaded
      setPiano(smplrPiano)
    })
    return () => {
      // smplrPiano.stop() // Clean up
    }
  }, [])

  // Play sound when a key is pressed
  const playSound = (note: string) => {
    if (piano) {
      piano.start({ note }) // Play the note
    }
  }

  // Handle key press (click or keyboard)
  const handleKeyPress = (keyId: string, note: string) => {
    setActiveKey(keyId)
    playSound(note)
  }

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = keys.find((k) => k.id === event.key.toUpperCase())
      if (key) {
        handleKeyPress(key.id, key.note)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [keys, piano])

  return (
    <div className="flex justify-center items-start mt-10">
      <div className="flex relative">
        {keys.map((key) => (
          <div
            key={key.id}
            className={`flex justify-center items-end pb-2 cursor-pointer select-none ${
              key.type === 'white'
                ? 'w-12 h-48 bg-white border border-gray-300 rounded-b'
                : 'w-8 h-32 bg-black text-white -mx-4 z-10 rounded-b'
            } ${
              activeKey === key.id
                ? key.type === 'white'
                  ? 'bg-yellow-200'
                  : 'bg-yellow-600'
                : ''
            }`}
            onClick={() => handleKeyPress(key.id, key.note)}
          >
            {key.type === 'white' && (
              <span className="text-sm text-gray-600">{key.id}</span>
            )}
            {key.type === 'black' && (
              <span className="text-sm text-white">{key.id}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const Piano = () => {
  return (
    <div className="p-4 bg-gray-800 h-full w-full">
      <PianoTest />
      {/*} <VirtualPiano /> */}
    </div>
  )
}

export default Piano
