import { describe, it, expect } from 'vitest'
import { analyzePosture } from '../utils/postureAnalysis'

/** Build a minimal flat landmark array of 33 entries (all zeros by default). */
function makeLandmarks(overrides = {}) {
  const lms = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 1 }))
  Object.entries(overrides).forEach(([idx, vals]) => {
    lms[Number(idx)] = { ...lms[Number(idx)], ...vals }
  })
  return lms
}

describe('analyzePosture', () => {
  it('returns score 0 and no-pose issue when landmarks are null', () => {
    const { score, issues } = analyzePosture(null)
    expect(score).toBe(0)
    expect(issues).toContain('No pose detected')
  })

  it('returns score 0 when landmarks array is too short', () => {
    const { score } = analyzePosture([{ x: 0.5, y: 0.5, z: 0 }])
    expect(score).toBe(0)
  })

  it('returns high score for ideal frontal posture', () => {
    // Nose (0) centered above level shoulders (11, 12), hips (23, 24) aligned.
    const lms = makeLandmarks({
      0:  { x: 0.5, y: 0.3 },   // nose above shoulders
      11: { x: 0.4, y: 0.5 },   // left shoulder
      12: { x: 0.6, y: 0.5 },   // right shoulder (level)
      23: { x: 0.4, y: 0.8 },   // left hip
      24: { x: 0.6, y: 0.8 },   // right hip
    })
    const { score, issues } = analyzePosture(lms)
    expect(score).toBeGreaterThanOrEqual(75)
    expect(issues[0]).toMatch(/great posture/i)
  })

  it('penalizes uneven shoulders', () => {
    const lms = makeLandmarks({
      0:  { x: 0.5, y: 0.3 },
      11: { x: 0.4, y: 0.5 },
      12: { x: 0.6, y: 0.65 },  // right shoulder much lower
      23: { x: 0.4, y: 0.8 },
      24: { x: 0.6, y: 0.8 },
    })
    const { score, issues } = analyzePosture(lms)
    expect(score).toBeLessThan(100)
    expect(issues.some((i) => /shoulder/i.test(i))).toBe(true)
  })

  it('penalizes head that is too low', () => {
    const lms = makeLandmarks({
      0:  { x: 0.5, y: 0.7 },   // nose below shoulders
      11: { x: 0.4, y: 0.5 },
      12: { x: 0.6, y: 0.5 },
      23: { x: 0.4, y: 0.8 },
      24: { x: 0.6, y: 0.8 },
    })
    const { score, issues } = analyzePosture(lms)
    expect(score).toBeLessThanOrEqual(80)
    expect(issues.some((i) => /head/i.test(i))).toBe(true)
  })

  it('score is never below 0', () => {
    // Worst possible posture
    const lms = makeLandmarks({
      0:  { x: 0.5, y: 0.9 },
      11: { x: 0.3, y: 0.5 },
      12: { x: 0.7, y: 0.8 },
      23: { x: 0.5, y: 0.6 },
      24: { x: 0.9, y: 0.6 },
    })
    const { score } = analyzePosture(lms)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})
