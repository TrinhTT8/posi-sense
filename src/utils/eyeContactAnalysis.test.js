import { describe, it, expect } from 'vitest'
import { analyzeEyeContact } from '../utils/eyeContactAnalysis'

function makeLandmarks(overrides = {}) {
  const lms = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 1 }))
  Object.entries(overrides).forEach(([idx, vals]) => {
    lms[Number(idx)] = { ...lms[Number(idx)], ...vals }
  })
  return lms
}

describe('analyzeEyeContact', () => {
  it('returns score 0 and no-face issue when landmarks are null', () => {
    const { score, issues } = analyzeEyeContact(null)
    expect(score).toBe(0)
    expect(issues).toContain('No face detected')
  })

  it('returns score 0 when landmarks array is too short', () => {
    const { score } = analyzeEyeContact([{ x: 0.5, y: 0.5 }])
    expect(score).toBe(0)
  })

  it('returns high score when face is fully frontal', () => {
    // Nose (0) exactly centered between symmetric ears (7, 8).
    const lms = makeLandmarks({
      0: { x: 0.5, y: 0.45 },  // nose
      7: { x: 0.3, y: 0.5 },   // left ear
      8: { x: 0.7, y: 0.5 },   // right ear (symmetric)
    })
    const { score, issues } = analyzeEyeContact(lms)
    expect(score).toBeGreaterThanOrEqual(80)
    expect(issues[0]).toMatch(/great eye contact/i)
  })

  it('penalizes when face is turned to the side (high ear asymmetry)', () => {
    const lms = makeLandmarks({
      0: { x: 0.5, y: 0.45 },
      7: { x: 0.35, y: 0.5 },  // left ear closer → turned right
      8: { x: 0.95, y: 0.5 },  // right ear far
    })
    const { score, issues } = analyzeEyeContact(lms)
    expect(score).toBeLessThan(75)
    expect(issues.some((i) => /camera/i.test(i))).toBe(true)
  })

  it('penalizes looking down (nose y much greater than ear avg y)', () => {
    const lms = makeLandmarks({
      0: { x: 0.5, y: 0.75 }, // nose very low (looking down)
      7: { x: 0.3, y: 0.45 },
      8: { x: 0.7, y: 0.45 },
    })
    const { score, issues } = analyzeEyeContact(lms)
    expect(score).toBeLessThan(80)
    expect(issues.some((i) => /down/i.test(i))).toBe(true)
  })

  it('returns reduced score when ear visibility is low', () => {
    const lms = makeLandmarks({
      0: { x: 0.5, y: 0.45 },
      7: { x: 0.3, y: 0.5, visibility: 0.1 },
      8: { x: 0.7, y: 0.5, visibility: 0.1 },
    })
    const { score } = analyzeEyeContact(lms)
    expect(score).toBeLessThanOrEqual(50)
  })

  it('score is never below 0', () => {
    const lms = makeLandmarks({
      0: { x: 0.5, y: 0.9 },
      7: { x: 0.48, y: 0.4 },
      8: { x: 0.95, y: 0.4 },
    })
    const { score } = analyzeEyeContact(lms)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})
