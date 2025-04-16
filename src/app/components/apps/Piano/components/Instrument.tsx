import React, { Fragment, useState, useEffect, JSX } from 'react'

import { Tone } from './Player'

import NOTES from '../components/Notes'
const getKeyShortcut = (keyboardMap: KeyboardMap, note: string): string[] => {
  const keyShortcut = Object.keys(keyboardMap)
  return keyShortcut.filter((shortcut) => keyboardMap[shortcut] === note)
}

interface KeyboardMap {
  [key: string]: string
}

interface InstrumentProps {
  instrumentName: string
  startNote: string
  endNote: string
  renderPianoKey: (props: PianoKeyProps) => JSX.Element
  keyboardMap: KeyboardMap
}

interface PianoKeyProps {
  note: string
  isAccidentalNote: boolean
  isNotePlaying: boolean
  startPlayingNote: () => void
  stopPlayingNote: () => void
  keyboardShortcut: string[]
}

interface State {
  notesPlaying: string[]
}

function getNotesMid(startNote: string, endNote: string): string[] {
  const startingIndex = NOTES.indexOf(startNote)
  const endingIndex = NOTES.indexOf(endNote)
  return NOTES.slice(startingIndex, endingIndex + 1)
}
const isAccidentalNote = (note: any) => {
  return NOTES.includes(note) && note.includes('#')
}

const isRegularKey = (event: KeyboardEvent): boolean => {
  return !event.ctrlKey && !event.metaKey && !event.shiftKey
}
const Instrument: React.FC<InstrumentProps> = ({
  instrumentName,
  startNote,
  endNote,
  renderPianoKey,
  keyboardMap,
}) => {
  const notes = getNotesMid(startNote, endNote)

  const [state, setState] = useState<State>({
    notesPlaying: [],
  })

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }, [])

  const getNoteFromKeyboardKey = (keyboardKey: string): string | undefined => {
    return keyboardMap[keyboardKey?.toUpperCase()]
  }

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (isRegularKey(e) && !e.repeat) {
      const note = getNoteFromKeyboardKey(e.key)
      if (note) {
        setState({ ...state, notesPlaying: [...state.notesPlaying, note] })
      }
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (isRegularKey(e) && !e.repeat) {
      const note = getNoteFromKeyboardKey(e.key)
      if (note) {
        setState({
          ...state,
          notesPlaying: state.notesPlaying.filter(
            (notePlaying) => notePlaying !== note
          ),
        })
      }
    }
  }

  const onPlayNoteStart = (note: string): void => {
    setState({ ...state, notesPlaying: [...state.notesPlaying, note] })
  }

  const onPlayNoteEnd = (note: string): void => {
    setState({
      ...state,
      notesPlaying: state.notesPlaying.filter(
        (notePlaying: string) => notePlaying !== note
      ),
    })
  }

  //rendering piano keys
  return (
    <Fragment>
      {notes.map((note) => {
        return (
          <Fragment key={note}>
            {renderPianoKey({
              note,
              isAccidentalNote: isAccidentalNote(note),
              isNotePlaying: state.notesPlaying.includes(note),
              startPlayingNote: () => onPlayNoteStart(note),
              stopPlayingNote: () => onPlayNoteEnd(note),
              keyboardShortcut: getKeyShortcut(keyboardMap, note),
            })}
          </Fragment>
        )
      })}

      <Tone instrumentName={instrumentName} notes={state.notesPlaying} />
    </Fragment>
  )
}

export default Instrument
