import './FeedbackPanel.css'

/**
 * Aggregates all issues from every metric and shows prioritized coaching tips.
 * @param {{
 *   posture: { score: number, issues: string[] },
 *   eyeContact: { score: number, issues: string[] },
 *   movement: { score: number, issues: string[] },
 *   speech: { score: number, issues: string[] },
 *   transcript: string,
 * }} props
 */
export default function FeedbackPanel({ posture, eyeContact, movement, speech, transcript }) {
  // Build a flat list of issues tagged with their category, sorted by worst score first.
  const categories = [
    { label: 'Posture', icon: '🧍', ...posture },
    { label: 'Eye Contact', icon: '👁️', ...eyeContact },
    { label: 'Movement', icon: '🏃', ...movement },
    { label: 'Speech', icon: '🎙️', ...speech },
  ].sort((a, b) => a.score - b.score)

  const positiveIssues = ['Great posture! Keep it up.', 'Great eye contact! Keep looking at the camera.', 'Good stability!']

  // Only show actionable issues (not "good" confirmations) in the top panel.
  const actionable = categories.flatMap(({ label, icon, issues }) =>
    issues
      .filter((i) => !positiveIssues.some((p) => i.startsWith(p.slice(0, 10))))
      .map((issue) => ({ label, icon, issue })),
  )

  const allGood = actionable.length === 0

  return (
    <aside className="feedback-panel">
      <h2 className="feedback-panel__title">Live Coaching</h2>

      <div className="feedback-panel__tips">
        {allGood ? (
          <div className="feedback-panel__tip feedback-panel__tip--good">
            <span className="feedback-panel__tip-icon">🌟</span>
            <span>Everything looks great! Keep going.</span>
          </div>
        ) : (
          actionable.map(({ label, icon, issue }) => (
            <div key={`${label}-${issue}`} className="feedback-panel__tip">
              <span className="feedback-panel__tip-icon">{icon}</span>
              <div>
                <span className="feedback-panel__tip-category">{label}: </span>
                <span>{issue}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {transcript && (
        <div className="feedback-panel__transcript">
          <h3 className="feedback-panel__transcript-title">Transcript</h3>
          <p className="feedback-panel__transcript-text">{transcript}</p>
        </div>
      )}
    </aside>
  )
}
