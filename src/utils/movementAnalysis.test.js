import { describe, it, expect, beforeEach } from 'vitest'
import { createMovementTracker } from '../utils/movementAnalysis'

function makeLandmarks(lShoulderX, lShoulderY, rShoulderX, rShoulderY) {
  const lms = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 1 }))
  lms[11] = { x: lShoulderX, y: lShoulderY, z: 0, visibility: 1 }
  lms[12] = { x: rShoulderX, y: rShoulderY, z: 0, visibility: 1 }
  return lms
}

describe('createMovementTracker', () => {
  let tracker

  beforeEach(() => {
    tracker = createMovementTracker()
  })

  it('returns calibrating status for the first few frames', () => {
    const lms = makeLandmarks(0.4, 0.5, 0.6, 0.5)
    const result = tracker.update(lms)
    expect(result.issues[0]).toMatch(/calibrat/i)
    expect(result.score).toBe(100)
  })

  it('returns zero score when landmarks are null', () => {
    const { score } = tracker.update(null)
    expect(score).toBe(0)
  })

  it('returns high score when the body is completely still', () => {
    const lms = makeLandmarks(0.4, 0.5, 0.6, 0.5)
    // Feed 10 identical frames
    let result
    for (let i = 0; i < 10; i++) result = tracker.update(lms)
    expect(result.score).toBeGreaterThanOrEqual(75)
    expect(result.issues[0]).toMatch(/good stability/i)
  })

  it('penalizes excessive movement', () => {
    // Alternate between two very different positions to simulate lots of movement.
    let result
    for (let i = 0; i < 20; i++) {
      const x = i % 2 === 0 ? 0.2 : 0.8 // large swing
      result = tracker.update(makeLandmarks(x, 0.5, x + 0.2, 0.5))
    }
    expect(result.score).toBeLessThan(75)
    expect(result.issues.some((i) => /movement/i.test(i))).toBe(true)
  })

  it('reset clears the history', () => {
    // Build up a history of movement
    for (let i = 0; i < 20; i++) {
      const x = i % 2 === 0 ? 0.2 : 0.8
      tracker.update(makeLandmarks(x, 0.5, x + 0.2, 0.5))
    }
    tracker.reset()
    // After reset the first update should be calibrating again
    const result = tracker.update(makeLandmarks(0.4, 0.5, 0.6, 0.5))
    expect(result.issues[0]).toMatch(/calibrat/i)
  })

  it('score is never below 0', () => {
    for (let i = 0; i < 30; i++) {
      const x = (i % 10) / 10
      tracker.update(makeLandmarks(x, x, x + 0.1, x + 0.1))
    }
    const result = tracker.update(makeLandmarks(0.9, 0.9, 1.0, 1.0))
    expect(result.score).toBeGreaterThanOrEqual(0)
  })
})
