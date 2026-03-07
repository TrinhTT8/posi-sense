/**
 * Analyzes body movement stability from a rolling history of pose landmarks.
 *
 * Uses the midpoint of both shoulders as the body's reference center.
 * High variance in that point over time indicates excessive movement.
 *
 * A higher score (0–100) means the user is more still / stable.
 */

const HISTORY_SIZE = 30 // number of recent frames to consider

/**
 * @typedef {{ x: number, y: number, z: number, visibility?: number }} Landmark
 * @typedef {{ score: number, issues: string[] }} MovementResult
 */

/**
 * Factory that returns a stateful movement-tracker with an `update` method.
 * Call `tracker.update(landmarks)` on each video frame.
 * @returns {{ update: (landmarks: Landmark[] | null) => MovementResult, reset: () => void }}
 */
export function createMovementTracker() {
  /** @type {{ x: number, y: number }[]} */
  const history = []

  function reset() {
    history.length = 0
  }

  /**
   * @param {Landmark[] | null} landmarks
   * @returns {MovementResult}
   */
  function update(landmarks) {
    if (!landmarks || landmarks.length < 13) {
      return { score: 0, issues: ['No pose detected'] }
    }

    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]

    // Use shoulder midpoint as body center reference.
    const centerX = (leftShoulder.x + rightShoulder.x) / 2
    const centerY = (leftShoulder.y + rightShoulder.y) / 2

    history.push({ x: centerX, y: centerY })
    if (history.length > HISTORY_SIZE) {
      history.shift()
    }

    if (history.length < 5) {
      return { score: 100, issues: ['Calibrating…'] }
    }

    // Compute variance of the reference point position.
    const n = history.length
    const avgX = history.reduce((s, p) => s + p.x, 0) / n
    const avgY = history.reduce((s, p) => s + p.y, 0) / n

    const varianceX = history.reduce((s, p) => s + (p.x - avgX) ** 2, 0) / n
    const varianceY = history.reduce((s, p) => s + (p.y - avgY) ** 2, 0) / n

    const stdDev = Math.sqrt(varianceX + varianceY)

    const issues = []
    let deduction = 0

    if (stdDev > 0.05) {
      deduction += 50
      issues.push('Too much movement – try to stay still')
    } else if (stdDev > 0.025) {
      deduction += 25
      issues.push('Try to minimize body movement')
    }

    if (issues.length === 0) {
      issues.push('Good stability!')
    }

    return { score: Math.max(0, 100 - deduction), issues }
  }

  return { update, reset }
}
