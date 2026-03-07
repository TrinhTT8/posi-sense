/**
 * Utilities for drawing the pose skeleton and metric overlays on a canvas.
 */

/** MediaPipe Pose landmark connections (pairs of indices). */
export const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [24, 26], [25, 27], [26, 28],
  [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32],
]

/**
 * Map a score (0–100) to an rgba color string.
 * @param {number} score
 * @returns {string}
 */
function scoreToColor(score) {
  if (score >= 75) return 'rgba(0, 184, 148, 0.9)'    // green
  if (score >= 50) return 'rgba(253, 203, 110, 0.9)'  // yellow
  return 'rgba(214, 48, 49, 0.9)'                     // red
}

/**
 * Draw the full pose skeleton on the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./postureAnalysis').Landmark[]} landmarks
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {number} postureScore - Used to color-code the skeleton.
 */
export function drawSkeleton(ctx, landmarks, width, height, postureScore = 100) {
  if (!landmarks || landmarks.length === 0) return

  const color = scoreToColor(postureScore)

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  // Draw connections
  for (const [a, b] of POSE_CONNECTIONS) {
    const lmA = landmarks[a]
    const lmB = landmarks[b]
    if (!lmA || !lmB) continue
    if (
      lmA.visibility !== undefined && lmA.visibility < 0.3 ||
      lmB.visibility !== undefined && lmB.visibility < 0.3
    ) continue

    ctx.beginPath()
    ctx.moveTo(lmA.x * width, lmA.y * height)
    ctx.lineTo(lmB.x * width, lmB.y * height)
    ctx.stroke()
  }

  // Draw landmark dots
  ctx.fillStyle = color
  for (const lm of landmarks) {
    if (!lm) continue
    if (lm.visibility !== undefined && lm.visibility < 0.3) continue
    ctx.beginPath()
    ctx.arc(lm.x * width, lm.y * height, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

/**
 * Clear the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 */
export function clearCanvas(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)
}
