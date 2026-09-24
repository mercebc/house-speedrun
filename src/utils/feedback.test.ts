import { afterEach, describe, expect, it, vi } from 'vitest'
import { finishVibrationPattern, triggerFinishFeedback } from './feedback'

describe('finishVibrationPattern', () => {
  it('is a short single tick for an ordinary finish', () => {
    expect(finishVibrationPattern(false)).toEqual([30])
  })

  it('is a longer celebratory pattern for a personal best', () => {
    expect(finishVibrationPattern(true)).toEqual([40, 60, 40, 60, 120])
  })
})

describe('triggerFinishFeedback', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('vibrates with the ordinary pattern on a normal finish when enabled', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { ...navigator, vibrate })

    triggerFinishFeedback({ vibrationEnabled: true, soundEnabled: true }, false)

    expect(vibrate).toHaveBeenCalledWith([30])
  })

  it('vibrates with the celebratory pattern on a personal best', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { ...navigator, vibrate })

    triggerFinishFeedback({ vibrationEnabled: true, soundEnabled: false }, true)

    expect(vibrate).toHaveBeenCalledWith([40, 60, 40, 60, 120])
  })

  it('does not vibrate when vibration is disabled', () => {
    const vibrate = vi.fn()
    vi.stubGlobal('navigator', { ...navigator, vibrate })

    triggerFinishFeedback({ vibrationEnabled: false, soundEnabled: true }, true)

    expect(vibrate).not.toHaveBeenCalled()
  })
})
