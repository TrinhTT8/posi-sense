import { useEffect, useRef, useState, useCallback } from 'react'
import { analyzePosture } from '../utils/postureAnalysis'
import { analyzeEyeContact } from '../utils/eyeContactAnalysis'
import { createMovementTracker } from '../utils/movementAnalysis'
import { drawSkeleton, clearCanvas } from '../utils/drawingUtils'

const MEDIAPIPE_WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'

const POSE_MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

/**
 * @typedef {{
 *   posture: { score: number, issues: string[] },
 *   eyeContact: { score: number, issues: string[] },
 *   movement: { score: number, issues: string[] },
 * }} PoseMetrics
 */

const DEFAULT_METRICS = {
  posture: { score: 0, issues: ['Waiting for pose detection…'] },
  eyeContact: { score: 0, issues: ['Waiting for pose detection…'] },
  movement: { score: 0, issues: ['Calibrating…'] },
}

/**
 * Hook that sets up the webcam stream, runs MediaPipe pose detection on each
 * frame, draws the skeleton overlay, and returns computed metrics.
 *
 * @param {{ videoRef: React.RefObject, canvasRef: React.RefObject, active: boolean }} opts
 * @returns {{ metrics: PoseMetrics, modelReady: boolean, error: string | null }}
 */
export function usePoseDetection({ videoRef, canvasRef, active }) {
  const [metrics, setMetrics] = useState(DEFAULT_METRICS)
  const [modelReady, setModelReady] = useState(false)
  const [error, setError] = useState(null)

  const landmarkerRef = useRef(null)
  const animFrameRef = useRef(null)
  const streamRef = useRef(null)
  const movementTrackerRef = useRef(createMovementTracker())
  const lastVideoTimeRef = useRef(-1)

  // ------------------------------------------------------------------
  // Load MediaPipe PoseLandmarker
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      try {
        const { FilesetResolver, PoseLandmarker } = await import(
          '@mediapipe/tasks-vision'
        )
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH)
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: POSE_MODEL_PATH,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        })
        if (!cancelled) {
          landmarkerRef.current = landmarker
          setModelReady(true)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load pose model:', err)
          setError('Failed to load pose model. Check your connection and reload.')
        }
      }
    }

    loadModel()
    return () => {
      cancelled = true
    }
  }, [])

  // ------------------------------------------------------------------
  // Start / stop webcam + detection loop
  // ------------------------------------------------------------------
  const stopStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    movementTrackerRef.current.reset()
    lastVideoTimeRef.current = -1
    setMetrics(DEFAULT_METRICS)
  }, [videoRef])

  useEffect(() => {
    if (!active) {
      stopStream()
      return
    }
    if (!modelReady) return

    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        video.srcObject = stream
        await video.play()
        runDetectionLoop()
      } catch (err) {
        if (!cancelled) {
          console.error('Webcam error:', err)
          setError('Could not access webcam. Please allow camera permissions.')
        }
      }
    }

    function runDetectionLoop() {
      if (!landmarkerRef.current || cancelled) return

      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      const now = performance.now()
      if (video.currentTime !== lastVideoTimeRef.current && video.readyState >= 2) {
        lastVideoTimeRef.current = video.currentTime

        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        const ctx = canvas.getContext('2d')
        clearCanvas(ctx, canvas.width, canvas.height)

        const result = landmarkerRef.current.detectForVideo(video, now)
        const normLandmarks = result?.landmarks?.[0] ?? null

        const posture = analyzePosture(normLandmarks)
        const eyeContact = analyzeEyeContact(normLandmarks)
        const movement = movementTrackerRef.current.update(normLandmarks)

        setMetrics({ posture, eyeContact, movement })

        if (normLandmarks) {
          drawSkeleton(ctx, normLandmarks, canvas.width, canvas.height, posture.score)
        }
      }

      animFrameRef.current = requestAnimationFrame(runDetectionLoop)
    }

    startCamera()

    return () => {
      cancelled = true
      stopStream()
    }
  }, [active, modelReady, videoRef, canvasRef, stopStream])

  return { metrics, modelReady, error }
}
