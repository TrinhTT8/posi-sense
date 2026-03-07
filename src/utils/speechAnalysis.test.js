import { describe, it, expect } from 'vitest'
import {
  countWords,
  countFillerWords,
  calculateWPM,
  analyzeSpeechPace,
  FILLER_WORDS,
  IDEAL_WPM_MIN,
  IDEAL_WPM_MAX,
} from '../utils/speechAnalysis'

describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
  })

  it('counts single word', () => {
    expect(countWords('hello')).toBe(1)
  })

  it('counts multiple words', () => {
    expect(countWords('hello world this is a test')).toBe(6)
  })

  it('handles extra whitespace', () => {
    expect(countWords('  one   two  three  ')).toBe(3)
  })
})

describe('countFillerWords', () => {
  it('returns 0 for empty string', () => {
    expect(countFillerWords('')).toBe(0)
    expect(countFillerWords(null)).toBe(0)
  })

  it('detects "um" and "uh"', () => {
    expect(countFillerWords('um I was uh thinking')).toBe(2)
  })

  it('detects "like" as a filler', () => {
    expect(countFillerWords("I was like totally like you know")).toBeGreaterThanOrEqual(2)
  })

  it('is case-insensitive', () => {
    expect(countFillerWords('UM UH LIKE')).toBeGreaterThanOrEqual(3)
  })

  it('does not match partial words', () => {
    // "umbrella" should not match "um"
    expect(countFillerWords('umbrella')).toBe(0)
  })

  it('all FILLER_WORDS are covered', () => {
    const text = FILLER_WORDS.join(' ')
    expect(countFillerWords(text)).toBeGreaterThanOrEqual(FILLER_WORDS.length)
  })
})

describe('calculateWPM', () => {
  it('returns 0 when elapsed seconds < 1', () => {
    expect(calculateWPM(100, 0)).toBe(0)
    expect(calculateWPM(100, 0.5)).toBe(0)
  })

  it('calculates correct WPM', () => {
    expect(calculateWPM(120, 60)).toBe(120)
    expect(calculateWPM(60, 60)).toBe(60)
    expect(calculateWPM(200, 60)).toBe(200)
  })

  it('rounds to nearest integer', () => {
    const wpm = calculateWPM(150, 60)
    expect(Number.isInteger(wpm)).toBe(true)
  })
})

describe('analyzeSpeechPace', () => {
  it('returns neutral result when not speaking', () => {
    const { score, issues } = analyzeSpeechPace(0, 0, false)
    expect(score).toBe(100)
    expect(issues[0]).toMatch(/speak/i)
  })

  it('returns high score for ideal WPM range', () => {
    const idealWpm = Math.round((IDEAL_WPM_MIN + IDEAL_WPM_MAX) / 2)
    const { score } = analyzeSpeechPace(idealWpm, 0, true)
    expect(score).toBeGreaterThanOrEqual(85)
  })

  it('penalizes too slow speech', () => {
    const { score, issues } = analyzeSpeechPace(50, 0, true)
    expect(score).toBeLessThan(75)
    expect(issues.some((i) => /slow/i.test(i))).toBe(true)
  })

  it('penalizes too fast speech', () => {
    const { score, issues } = analyzeSpeechPace(250, 0, true)
    expect(score).toBeLessThan(75)
    expect(issues.some((i) => /fast/i.test(i))).toBe(true)
  })

  it('penalizes many filler words', () => {
    const idealWpm = Math.round((IDEAL_WPM_MIN + IDEAL_WPM_MAX) / 2)
    const { score, issues } = analyzeSpeechPace(idealWpm, 6, true)
    expect(score).toBeLessThan(80)
    expect(issues.some((i) => /filler/i.test(i))).toBe(true)
  })

  it('score is never below 0', () => {
    const { score } = analyzeSpeechPace(10, 20, true)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})
