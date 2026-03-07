/**
 * Analyzes eye contact / head orientation from MediaPipe pose landmarks.
 *
 * Key landmarks used:
 *   0 – nose
 *   7 – left ear
 *   8 – right ear
 *
 * When facing forward both ears are roughly equidistant from the nose.
 * A large asymmetry means the head is turned away from the camera.
 *
 * A higher score (0–100) means better eye contact.
 */

/**
 * @typedef {{ x: number, y: number, z: number, visibility?: number }} Landmark
 * @typedef {{ score: number, issues: string[] }} EyeContactResult
 */

/**
 * Compute eye-contact score from a flat array of normalized landmarks.
 * @param {Landmark[] | null} landmarks
 * @returns {EyeContactResult}
 */
export function analyzeEyeContact(landmarks) {
  if (!landmarks || landmarks.length < 9) {
    return { score: 0, issues: ['No face detected'] }
  }

  const nose = landmarks[0]
  const leftEar = landmarks[7]
  const rightEar = landmarks[8]

  // Validate visibility – MediaPipe may return landmarks with low confidence.
  const minVis = 0.3
  if (
    (leftEar.visibility !== undefined && leftEar.visibility < minVis) ||
    (rightEar.visibility !== undefined && rightEar.visibility < minVis)
  ) {
    return { score: 40, issues: ['Face not fully visible – face the camera'] }
  }

  const issues = []
  let deduction = 0

  // --- Horizontal orientation (left-right turn) ---
  // Distance from nose to each ear; equal means frontal view.
  const leftEarDist = Math.abs(nose.x - leftEar.x)
  const rightEarDist = Math.abs(nose.x - rightEar.x)
  const total = leftEarDist + rightEarDist

  const asymmetry = total > 0.001 ? Math.abs(leftEarDist - rightEarDist) / total : 0

  if (asymmetry > 0.35) {
    deduction += 50
    issues.push('Not looking at the camera – face forward')
  } else if (asymmetry > 0.18) {
    deduction += 25
    issues.push('Slightly off-camera – turn toward the lens')
  }

  // --- Vertical orientation (looking up / down) ---
  // When looking forward, nose y should be between ear y values.
  const earAvgY = (leftEar.y + rightEar.y) / 2
  const verticalOffset = nose.y - earAvgY

  if (verticalOffset > 0.12) {
    deduction += 25
    issues.push('Looking down – maintain eye contact with the camera')
  } else if (verticalOffset < -0.12) {
    deduction += 15
    issues.push('Looking up – lower your gaze slightly')
  }

  if (issues.length === 0) {
    issues.push('Great eye contact! Keep looking at the camera.')
  }

  return { score: Math.max(0, 100 - deduction), issues }
}
