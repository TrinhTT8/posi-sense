import MetricCard from './MetricCard'
import './MetricsPanel.css'

/**
 * Grid of metric cards showing posture, eye contact, movement, and speech.
 * @param {{
 *   posture: { score: number, issues: string[] },
 *   eyeContact: { score: number, issues: string[] },
 *   movement: { score: number, issues: string[] },
 *   speech: { score: number, wpm: number, issues: string[], fillerCount: number },
 * }} props
 */
export default function MetricsPanel({ posture, eyeContact, movement, speech }) {
  return (
    <div className="metrics-panel">
      <MetricCard
        label="Posture"
        icon="🧍"
        score={posture.score}
        issues={posture.issues}
      />
      <MetricCard
        label="Eye Contact"
        icon="👁️"
        score={eyeContact.score}
        issues={eyeContact.issues}
      />
      <MetricCard
        label="Movement"
        icon="🏃"
        score={movement.score}
        issues={movement.issues}
      />
      <MetricCard
        label="Speech Pace"
        icon="🎙️"
        score={speech.score}
        issues={speech.issues}
        extra={speech.wpm > 0 ? `${speech.wpm} WPM · ${speech.fillerCount} filler word${speech.fillerCount !== 1 ? 's' : ''}` : undefined}
      />
    </div>
  )
}
