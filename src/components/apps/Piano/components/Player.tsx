import SoundFontPlayer from 'soundfont-player'
import AudioContext from './AudioContext'
import React, { useEffect, useState } from 'react'
import Musicalinstrument from './Instrument'

const NullSoundFontPlayerNoteAudio = {
  stop() {},
}

const NullSoundFontPlayer = {
  play(note: string) {
    return NullSoundFontPlayerNoteAudio
  },
}

const Player = () => {
  const audioContext = AudioContext && new AudioContext()

  let soundFPlayer = NullSoundFontPlayer

  const audioPlayer = {
    setInstrument(instrumentName: string) {
      SoundFontPlayer.instrument(
        audioContext!,
        instrumentName as SoundFontPlayer.InstrumentName
      )
        .then((soundFontPlayer: any) => {
          soundFPlayer = soundFontPlayer
        })
        .catch((e: Error) => {
          soundFPlayer = NullSoundFontPlayer
        })
    },
    playNote(note: string) {
      return soundFPlayer.play(note)
    },
  }

  return audioPlayer
}

interface ToneProps {
  instrumentName: string
  notes: string[]
}

const Tone = ({ instrumentName, notes }: ToneProps) => {
  interface InstrumentPlayer {
    setInstrument(instrumentName: string): void
    playNote(note: string): { stop(): void }
  }

  const [instrumentPlayer, setInstrumentPlayer] =
    useState<InstrumentPlayer | null>(null)
  useEffect(() => {
    setInstrumentPlayer(Player())
  }, [])

  const setInstrument = () => {
    instrumentPlayer?.setInstrument(instrumentName)
  }

  const playNotes = () => {
    if (instrumentPlayer) {
      instrumentPlayer.playNote(notes[0])
    }
  }

  useEffect(() => {
    if (instrumentPlayer) {
      setInstrument()
      playNotes()
    }
  }, [instrumentPlayer])

  useEffect(() => {
    if (notes && notes.length > 0) {
      playNotes()
    }
  }, [notes])

  return null
}

const VirtualPiano = () => {
  const accidentalKey = ({
    isPlaying,
    text,
    eventHandlers,
  }: {
    isPlaying: boolean
    text: string
    eventHandlers: React.DOMAttributes<HTMLButtonElement>
  }) => {
    return (
      <div className="piano-accidental-key-wrapper">
        <button
          className={`piano-accidental-key ${
            isPlaying ? 'piano-accidental-key-playing' : ''
          } `}
          {...eventHandlers}
        >
          <div className="piano-text">{text}</div>
        </button>
      </div>
    )
  }

  const naturalKey = ({
    isPlaying,
    text,
    eventHandlers,
  }: {
    isPlaying: boolean
    text: string
    eventHandlers: React.DOMAttributes<HTMLButtonElement>
  }) => {
    return (
      <button
        className={`piano-natural-key ${
          isPlaying ? 'piano-natural-key-playing' : ''
        } `}
        {...eventHandlers}
      >
        <div className="piano-text">{text}</div>
      </button>
    )
  }

  const renderPianoKey = ({
    isAccidentalNote,
    isNotePlaying,
    startPlayingNote,
    stopPlayingNote,
    keyboardShortcut,
  }: {
    isAccidentalNote: boolean
    isNotePlaying: boolean
    startPlayingNote: () => void
    stopPlayingNote: () => void
    keyboardShortcut: string[]
  }) => {
    const KeyComponent = isAccidentalNote ? accidentalKey : naturalKey

    const eventHandlers = {
      onMouseDown: startPlayingNote,
      onMouseUp: stopPlayingNote,
      onTouchStart: startPlayingNote,
      onMouseOut: stopPlayingNote,
      onTouchEnd: stopPlayingNote,
    }

    return (
      <KeyComponent
        isPlaying={isNotePlaying}
        text={keyboardShortcut.join('/')}
        eventHandlers={eventHandlers}
      />
    )
  }

  return (
    <div className="piano-container">
      <Musicalinstrument
        instrumentName={'acoustic_grand_piano'}
        startNote={'C3'}
        endNote={'B5'}
        renderPianoKey={renderPianoKey}
        keyboardMap={{
          Q: 'C3',
          1: 'C#3',
          W: 'D3',
          2: 'D#3',
          E: 'E3',
          R: 'F3',
          3: 'F#3',
          T: 'G3',
          4: 'G#3',
          Y: 'A3',
          5: 'A#3',
          U: 'B3',
          I: 'C4',
          6: 'C#4',
          O: 'D4',
          7: 'D#4',
          P: 'E4',
          Z: 'F4',
          8: 'F#4',
          X: 'G4',
          9: 'G#4',
          C: 'A4',
          0: 'A#4',
          V: 'B4',
          B: 'C5',
          H: 'C#5',
          N: 'D5',
          J: 'D#5',
          M: 'E5',
          K: 'F5',
          L: 'F#5',
          S: 'B5',
          A: 'G5',
          '=': 'G#5',
          D: 'A5',
          '/': 'A#5',
        }}
      />
    </div>
  )
}
export { Tone, Player }
export default VirtualPiano
