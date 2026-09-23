// Haptic and audio feedback for finishing a task. Thin browser-API wrappers
// (vibrate/playChime) are intentionally not deeply unit tested — they're
// glue over navigator.vibrate/AudioContext, verified manually in-browser.
// The pattern-selection logic itself is pure and tested.

export function finishVibrationPattern(isPersonalBest: boolean): number[] {
  return isPersonalBest ? [40, 60, 40, 60, 120] : [30]
}

export function isVibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

export function vibrate(pattern: number | number[]): void {
  if (!isVibrationSupported()) return
  navigator.vibrate(pattern)
}

type AudioContextConstructor = typeof AudioContext

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext ?? null
}

export function isSoundSupported(): boolean {
  return getAudioContextConstructor() !== null
}

export interface FeedbackSettings {
  vibrationEnabled: boolean
  soundEnabled: boolean
}

// Called once per finished task/run: a light haptic tick always (if
// enabled), plus a chime and a longer buzz specifically for a personal
// best — never on an ordinary finish, since that's a real achievement.
export function triggerFinishFeedback(settings: FeedbackSettings, isPersonalBest: boolean): void {
  if (settings.vibrationEnabled) {
    vibrate(finishVibrationPattern(isPersonalBest))
  }
  if (settings.soundEnabled && isPersonalBest) {
    playChime()
  }
}

// A short ascending three-note chime (no audio file needed) for a personal best.
export function playChime(): void {
  const AudioContextClass = getAudioContextConstructor()
  if (AudioContextClass === null) return

  const ctx = new AudioContextClass()
  const startTime = ctx.currentTime
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5

  notes.forEach((frequency, index) => {
    const noteStart = startTime + index * 0.09
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.15, noteStart)
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.25)

    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(noteStart)
    oscillator.stop(noteStart + 0.3)
  })
}
