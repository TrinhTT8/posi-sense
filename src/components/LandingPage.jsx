import './LandingPage.css'

const FEATURES = [
  {
    icon: '🧍',
    title: 'Posture Analysis',
    desc: 'Get real-time feedback on shoulder alignment, head position, and overall body posture.',
  },
  {
    icon: '👁️',
    title: 'Eye Contact Detection',
    desc: 'Track how well you maintain eye contact with the camera – a key signal of confidence.',
  },
  {
    icon: '🏃',
    title: 'Movement Tracking',
    desc: 'Detect excessive fidgeting or swaying that can distract interviewers.',
  },
  {
    icon: '🎙️',
    title: 'Speech Pace',
    desc: 'Measure your words per minute and flag filler words (um, uh, like…) in real time.',
  },
]

/**
 * Landing page shown before starting a practice session.
 * @param {{ onStart: () => void }} props
 */
export default function LandingPage({ onStart }) {
  return (
    <main className="landing">
      <header className="landing__hero">
        <div className="landing__logo">
          <span className="landing__logo-icon">P</span>
          <span className="landing__logo-text">PosiSense</span>
        </div>
        <h1 className="landing__headline">
          Ace your next interview with&nbsp;
          <span className="landing__headline-accent">real-time coaching</span>
        </h1>
        <p className="landing__subheadline">
          PosiSense uses your webcam and microphone to analyze your posture,
          eye contact, body movement, and speech pace — all locally in your
          browser, privately.
        </p>
        <button className="landing__cta" onClick={onStart}>
          Start Practice Session
        </button>
        <p className="landing__privacy">
          🔒 Your video and audio never leave your device.
        </p>
      </header>

      <section className="landing__features">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="landing__feature-card">
            <span className="landing__feature-icon" aria-hidden="true">
              {icon}
            </span>
            <h3 className="landing__feature-title">{title}</h3>
            <p className="landing__feature-desc">{desc}</p>
          </div>
        ))}
      </section>

      <section className="landing__tips">
        <h2 className="landing__tips-title">Tips for best results</h2>
        <ul className="landing__tips-list">
          <li>Sit in a well-lit room with light facing you (not behind you).</li>
          <li>Position your webcam at eye level.</li>
          <li>Allow camera and microphone access when prompted.</li>
          <li>Use Chrome or Edge for full speech-recognition support.</li>
        </ul>
      </section>
    </main>
  )
}
