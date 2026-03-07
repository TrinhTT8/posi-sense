/**
 * Analyzes body posture from MediaPipe pose landmarks.
 *
 * Key landmarks used:
 *   0  – nose
 *   7  – left ear
 *   8  – right ear
 *   11 – left shoulder
 *   12 – right shoulder
 *   23 – left hip
 *   24 – right hip
 *
 * All coordinates are normalized [0, 1] in the image frame.
 * A higher score (0–100) means better posture.
 */

/**
 * @typedef {{ x: number, y: number, z: number, visibility?: number }} Landmark
 * @typedef {{ score: number, issues: string[] }} PostureResult
 */

/**
 * Compute posture score from a flat array of normalized landmarks.
 * @param {Landmark[] | null} landmarks - Flat array of 33 pose landmarks (or null).
 * @returns {PostureResult}
 */
export function analyzePosture(landmarks) {
  if (!landmarks || landmarks.length < 25) {
    return { score: 0, issues: ['No pose detected'] }
  }

  const nose = landmarks[0]
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftHip = landmarks[23]
  const rightHip = landmarks[24]

  const issues = []
  let deduction = 0

  // --- Shoulder level check ---
  // Both shoulders should have similar y-coordinates (level shoulders).
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y)
  if (shoulderTilt > 0.06) {
    deduction += 25
    issues.push('Shoulders are uneven – try to level them')
  } else if (shoulderTilt > 0.03) {
    deduction += 10
    issues.push('Shoulders are slightly uneven')
  }

  // --- Slouching check ---
  // The horizontal midpoint of shoulders should roughly align with hips.
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2
  const hipMidX = (leftHip.x + rightHip.x) / 2
  const lateralShift = Math.abs(shoulderMidX - hipMidX)
  if (lateralShift > 0.1) {
    deduction += 25
    issues.push('Possible slouching – sit or stand upright')
  } else if (lateralShift > 0.05) {
    deduction += 10
    issues.push('Slight lean – try to sit upright')
  }

  // --- Head centering check ---
  // Nose x should be close to shoulder midpoint x.
  const headOffset = Math.abs(nose.x - shoulderMidX)
  if (headOffset > 0.12) {
    deduction += 20
    issues.push('Head is tilted to the side')
  } else if (headOffset > 0.06) {
    deduction += 8
    issues.push('Head is slightly off-center')
  }

  // --- Head height check ---
  // Nose should be above the shoulders (lower y value in image coords).
  const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
  if (nose.y > shoulderAvgY) {
    deduction += 20
    issues.push('Head is too low – lift your chin slightly')
  }

  if (issues.length === 0) {
    issues.push('Great posture! Keep it up.')
  }

  return { score: Math.max(0, 100 - deduction), issues }
}
