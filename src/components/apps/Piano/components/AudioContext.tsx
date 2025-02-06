const AudioContext =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as any).webkitAudioContext
    : null
export default AudioContext
