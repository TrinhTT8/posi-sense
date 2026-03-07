import { useRef } from 'react'
import { usePoseDetection } from '../hooks/usePoseDetection'
import { useSpeechAnalysis } from '../hooks/useSpeechAnalysis'
import MetricsPanel from './MetricsPanel'
import FeedbackPanel from './FeedbackPanel'
import './InterviewSession.css'

/**
 * Full practice session view: webcam feed with pose overlay + metrics sidebar.
 * @param {{ onEnd: () => void }} props
 */
export default function InterviewSession({ onEnd }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const { metrics, modelReady, error } = usePoseDetection({
    videoRef,
    canvasRef,
    active: true,
  })

  const { speechMetrics } = useSpeechAnalysis({ active: true })

  return (
    <div className="session">
      {/* ── Top bar ──────────────────────────────────── */}
      <header className="session__topbar">
        <div className="session__logo">
          <span className="session__logo-icon">P</span>
          <span>PosiSense</span>
        </div>
        <div className="session__status">
          {error ? (
            <span className="session__badge session__badge--error">⚠ {error}</span>
          ) : modelReady ? (
            <span className="session__badge session__badge--live">● LIVE</span>
          ) : (
            <span className="session__badge session__badge--loading">
              ⏳ Loading AI model…
            </span>
          )}
        </div>
        <button className="session__end-btn" onClick={onEnd}>
          End Session
        </button>
      </header>

      {/* ── Main layout ──────────────────────────────── */}
      <div className="session__body">
        {/* Webcam + skeleton overlay */}
        <section className="session__camera-section">
          <div className="session__camera-wrap">
            <video
              ref={videoRef}
              className="session__video"
              autoPlay
              playsInline
              muted
              aria-label="Webcam feed"
            />
            <canvas ref={canvasRef} className="session__canvas" aria-hidden="true" />
            {!modelReady && !error && (
              <div className="session__camera-overlay">
                <div className="session__spinner" />
                <p>Loading pose model…</p>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar: metrics + feedback */}
        <aside className="session__sidebar">
          <MetricsPanel
            posture={metrics.posture}
            eyeContact={metrics.eyeContact}
            movement={metrics.movement}
            speech={speechMetrics}
          />
          <FeedbackPanel
            posture={metrics.posture}
            eyeContact={metrics.eyeContact}
            movement={metrics.movement}
            speech={speechMetrics}
            transcript={speechMetrics.transcript}
          />
        </aside>
      </div>
    </div>
  )
}
