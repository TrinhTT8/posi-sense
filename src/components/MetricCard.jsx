import './MetricCard.css'

/**
 * Circular score gauge + label + issues list.
 * @param {{ label: string, icon: string, score: number, issues: string[], extra?: string }} props
 */
export default function MetricCard({ label, icon, score, issues, extra }) {
  const level = score >= 75 ? 'good' : score >= 50 ? 'warn' : 'bad'

  // SVG ring parameters
  const r = 28
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className={`metric-card metric-card--${level}`}>
      <div className="metric-card__header">
        <span className="metric-card__icon" aria-hidden="true">{icon}</span>
        <span className="metric-card__label">{label}</span>
      </div>

      <div className="metric-card__gauge-row">
        <svg className="metric-card__ring" viewBox="0 0 70 70" aria-hidden="true">
          <circle
            className="metric-card__ring-bg"
            cx="35" cy="35" r={r}
            fill="none" strokeWidth="6"
          />
          <circle
            className={`metric-card__ring-fill metric-card__ring-fill--${level}`}
            cx="35" cy="35" r={r}
            fill="none" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 35 35)"
          />
        </svg>
        <div className="metric-card__score-box">
          <span className={`metric-card__score metric-card__score--${level}`}>
            {score}
          </span>
          <span className="metric-card__score-label">/100</span>
        </div>
      </div>

      {extra && <p className="metric-card__extra">{extra}</p>}

      <ul className="metric-card__issues">
        {issues.slice(0, 2).map((issue) => (
          <li key={issue} className="metric-card__issue">
            {issue}
          </li>
        ))}
      </ul>
    </div>
  )
}
