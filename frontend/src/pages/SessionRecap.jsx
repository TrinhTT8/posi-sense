import React, { useEffect, useState } from "react";
import CircularScoreBar from "../components/analytics/CircularScoreBar";
import MetricCard from "../components/analytics/MetricCard";
import SessionTimeline from "../components/analytics/SessionTimeline";
import ProgressChart from "../components/analytics/ProgressChart";
import ScoreCelebration from "../components/ScoreCelebration";
// import { generateMockSession, generateMultipleSessions } from "../mockData";
import { THRESHOLDS, getThresholdStatus } from "../thresholds";

const METRIC_ICONS = {
  eyeContact: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path stroke="#0D9488" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
      <circle cx="12" cy="12" r="3" stroke="#0D9488" strokeWidth="2"/>
    </svg>
  ),
  blinkRate: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="#0D9488" strokeWidth="2"/>
      <path stroke="#0D9488" strokeWidth="2" d="M12 7v5l3 3"/>
    </svg>
  ),
  speakingPace: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="2" rx="1" fill="#0D9488"/>
    </svg>
  ),
  fillerWords: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="#0D9488" strokeWidth="2"/>
      <path stroke="#0D9488" strokeWidth="2" d="M8 12h8"/>
    </svg>
  ),
  expression: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="#0D9488" strokeWidth="2"/>
      <path stroke="#0D9488" strokeWidth="2" d="M8 15c1.333-1 4.667-1 6 0"/>
    </svg>
  )
};

function SessionRecap({ userId = "user123" }) {
  const [currentSession, setCurrentSession] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch real session data from backend
  useEffect(() => {
    setLoading(true);
    async function fetchSessionData() {
      try {
        // Get latest session
        const res = await fetch(`/api/sessions/${userId}/latest`);
        const session = await res.json();
        setCurrentSession(session);
        // Get all sessions
        const resAll = await fetch(`/api/sessions/${userId}`);
        const sessions = await resAll.json();
        setAllSessions(sessions);
        setTimeout(() => {
          setLoading(false);
          if (session && session.overallScore >= 70) {
            setTimeout(() => setShowCelebration(true), 1500);
          }
        }, 600);
      } catch (e) {
        setLoading(false);
      }
    }
    fetchSessionData();
  }, [userId]);

  // Spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="animate-spin rounded-full border-4 border-t-transparent border-[#0D9488] w-12 h-12 mb-4" />
        <div className="text-[#64748B] text-lg">Analyzing your session...</div>
      </div>
    );
  }

  if (!currentSession) return null;

  // Timeline spikes
  const spikes = [
    ...(currentSession.blinkRate.spikes || []).map(s => ({
      timestamp: s.timestamp,
      type: "blinkRate",
      severity: getThresholdStatus("blinkRate", s.rate).color === "red" ? "red" : "amber",
      message: `Blink rate spiked to ${s.rate} BPM`
    })),
    ...(currentSession.speakingPace.silences || []).map(s => ({
      timestamp: s.timestamp,
      type: "speakingPace",
      severity: s.duration > 2 ? "red" : "amber",
      message: `Long pause (${s.duration.toFixed(1)}s)`
    })),
    ...(currentSession.expression.tensionSpikes || []).map(s => ({
      timestamp: s.timestamp,
      type: "expression",
      severity: s.intensity > 0.7 ? "red" : "amber",
      message: `Tension spike (intensity ${s.intensity.toFixed(2)})`
    }))
  ];

  // Suggestions
  const suggestions = [];
  if (currentSession.eyeContact.score < 65) {
    suggestions.push({
      metric: "eyeContact",
      message: THRESHOLDS.eyeContact.ranges.red.message
    });
  }
  if (currentSession.blinkRate.average > 20 || currentSession.blinkRate.average < 12) {
    suggestions.push({
      metric: "blinkRate",
      message: currentSession.blinkRate.average > 20 ? THRESHOLDS.blinkRate.ranges.red2.message : THRESHOLDS.blinkRate.ranges.red.message
    });
  }
  if (currentSession.speakingPace.averageWPM > 165 || currentSession.speakingPace.averageWPM < 120) {
    suggestions.push({
      metric: "speakingPace",
      message: currentSession.speakingPace.averageWPM > 165 ? THRESHOLDS.speakingPace.ranges.red2.message : THRESHOLDS.speakingPace.ranges.red.message
    });
  }
  if (currentSession.speakingPace.fillerWords.total > 3) {
    suggestions.push({
      metric: "fillerWords",
      message: THRESHOLDS.fillerWords.ranges.red.message
    });
  }
  const domTone = currentSession.expression.dominantTone;
  if (domTone === "tense" || domTone === "stressed") {
    suggestions.push({
      metric: "expression",
      message: domTone === "tense" ? THRESHOLDS.expression.ranges.amber2.message : THRESHOLDS.expression.ranges.red.message
    });
  }

  // Handlers
  async function handlePracticeAgain() {
    setLoading(true);
    setShowCelebration(false);
    // Optionally POST to /api/sessions to start a new session
    window.location.href = "/practice";
  }

  function handleViewAquarium() {
    // TODO: open aquarium modal or route
    console.log("open aquarium");
  }

  return (
    <div className="max-w-4xl mx-auto bg-[#F8FAFC] min-h-screen px-6 py-10 relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <ScoreCelebration score={currentSession.overallScore} onComplete={() => setShowCelebration(false)} />
      )}
      {/* Section 1: Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="text-[32px] font-bold text-[#0F172A]">Session Recap</div>
          <div className="italic text-[#64748B] mt-1">{currentSession.question}</div>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="bg-[#0D9488] text-white rounded-full px-4 py-1 text-sm font-semibold capitalize">
            {currentSession.category}
          </span>
        </div>
      </div>
      {/* Section 2: Score and Metrics */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex justify-center items-center">
          <CircularScoreBar score={currentSession.overallScore} size={220} />
        </div>
        <div className="grid grid-cols-2 gap-4 flex-1">
          <MetricCard
            metric="eyeContact"
            value={currentSession.eyeContact.score}
            label="Eye Contact"
            unit="% on camera"
          />
          <MetricCard
            metric="blinkRate"
            value={currentSession.blinkRate.average}
            label="Blink Rate"
            unit="BPM"
          />
          <MetricCard
            metric="speakingPace"
            value={currentSession.speakingPace.averageWPM}
            label="Speaking Pace"
            unit="WPM"
          />
          <MetricCard
            metric="fillerWords"
            value={currentSession.speakingPace.fillerWords.total}
            label="Filler Words"
            unit="per answer"
          />
        </div>
      </div>
      {/* Section 3: Timeline */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="text-xs font-bold uppercase" style={{ color: "#64748B" }}>What Happened</div>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>
        <SessionTimeline duration={currentSession.duration} spikes={spikes} />
      </div>
      {/* Section 4: Suggestions */}
      <div className="mb-10">
        <div className="text-xs font-bold uppercase mb-3" style={{ color: "#64748B" }}>Coaching Tips</div>
        {suggestions.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2"/>
              <path stroke="#10B981" strokeWidth="2" d="M7 13l3 3 7-7"/>
            </svg>
            Outstanding session — no areas of concern detected.
          </div>
        ) : (
          <div className="grid gap-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center bg-[#F0FDFA] border-l-4 border-[#0D9488] rounded-lg px-4 py-3 gap-3">
                {METRIC_ICONS[s.metric]}
                <span className="text-[#0F172A] text-sm">{s.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Section 5: Progress Chart */}
      <div className="mb-10">
        <div className="text-xs font-bold uppercase mb-3" style={{ color: "#64748B" }}>Your Progress</div>
        <ProgressChart sessions={allSessions} />
      </div>
      {/* Section 6: Action buttons */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="flex gap-4 mb-1">
          <button
            className="border-2 border-[#0D9488] text-[#0D9488] font-semibold px-6 py-2 rounded-full hover:bg-[#F0FDFA] transition"
            onClick={handlePracticeAgain}
          >
            Practice Again
          </button>
          <button
            className="bg-[#0D9488] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#0F766E] transition"
            onClick={handleViewAquarium}
          >
            View My Aquarium
          </button>
        </div>
        <div className="text-xs text-[#94A3B8]">Session saved to your profile.</div>
      </div>
    </div>
  );
}

export default SessionRecap;