/**
 * Analyzes speech pace from a rolling transcript history.
 *
 * Ideal interview speaking pace: 120–160 words per minute (WPM).
 * Below 80 WPM is too slow; above 200 WPM is too fast.
 *
 * A higher score (0–100) means a more appropriate pace.
 */

/** Common filler words to detect. */
export const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'sort of', 'kind of']

/** Ideal WPM range. */
export const IDEAL_WPM_MIN = 120
export const IDEAL_WPM_MAX = 160

/**
 * Count words in a string.
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/**
 * Count occurrences of filler words in a transcript.
 * @param {string} transcript
 * @returns {number}
 */
export function countFillerWords(transcript) {
  if (!transcript) return 0
  const lower = transcript.toLowerCase()
  return FILLER_WORDS.reduce((count, filler) => {
    const regex = new RegExp(`\\b${filler.replace(/\s+/g, '\\s+')}\\b`, 'gi')
    const matches = lower.match(regex)
    return count + (matches ? matches.length : 0)
  }, 0)
}

/**
 * Calculate words per minute from word count and elapsed seconds.
 * @param {number} wordCount
 * @param {number} elapsedSeconds
 * @returns {number}
 */
export function calculateWPM(wordCount, elapsedSeconds) {
  if (elapsedSeconds < 1) return 0
  return Math.round((wordCount / elapsedSeconds) * 60)
}

/**
 * Compute a speech pace score and list of issues.
 * @param {number} wpm - Words per minute (0 if not speaking).
 * @param {number} fillerCount - Number of filler words detected.
 * @param {boolean} isSpeaking - Whether the user is currently speaking.
 * @returns {{ score: number, wpm: number, issues: string[] }}
 */
export function analyzeSpeechPace(wpm, fillerCount, isSpeaking) {
  const issues = []
  let deduction = 0

  if (!isSpeaking || wpm === 0) {
    return { score: 100, wpm: 0, issues: ['Speak to get speech-pace feedback'] }
  }

  if (wpm < 80) {
    deduction += 35
    issues.push('Speaking too slowly – try to pick up the pace')
  } else if (wpm < IDEAL_WPM_MIN) {
    deduction += 15
    issues.push('Slightly slow – a bit faster would sound more natural')
  } else if (wpm > 200) {
    deduction += 35
    issues.push('Speaking too fast – slow down for clarity')
  } else if (wpm > IDEAL_WPM_MAX) {
    deduction += 15
    issues.push('Slightly fast – try to slow down a bit')
  }

  if (fillerCount >= 5) {
    deduction += 30
    issues.push('Many filler words detected (um, uh, like…) – practice pausing instead')
  } else if (fillerCount >= 2) {
    deduction += 15
    issues.push('Some filler words detected – try to minimize them')
  }

  if (issues.length === 0) {
    issues.push(`Great pace! ${wpm} WPM – clear and confident.`)
  }

  return { score: Math.max(0, 100 - deduction), wpm, issues }
}
