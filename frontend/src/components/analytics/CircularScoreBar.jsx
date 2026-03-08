import React, { useRef, useEffect, useState } from "react";

/**
 * Animated circular progress ring for displaying a user's overall session score.
 * Props:
 *   - score: Number (0-100)
 *   - size: Number (default 200)
 *   - strokeWidth: Number (default 12)
 *
 * When Presage integration is complete, score prop will be
 * calculated from live sensor data in SessionRecap.jsx
 */

const COLOR_STATES = [
  { min: 0, max: 49, color: "#EF4444" },      // red
  { min: 50, max: 69, color: "#F59E0B" },    // amber
  { min: 70, max: 90, color: "#0D9488" },   // teal
  { min: 91, max: 100, color: "#22C55E" }   // green
];

function getRingColor(score) {
  // Clamp score to 0-100
  const s = Math.max(0, Math.min(100, score));
  return COLOR_STATES.find(state => s >= state.min && s <= state.max).color;
}

function CircularScoreBar({ score, size = 200, strokeWidth = 12 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef();
  const duration = 1200; // ms
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringColor = getRingColor(score);
  const isGreen = score > 90;
  const isGold = false;

  // Animation
  useEffect(() => {
    let start;
    function animate(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(elapsed / duration, 1);
      setAnimatedScore(Math.round(pct * score));
      setProgress(pct * score);
      if (pct < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedScore(score);
        setProgress(score);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [score]);

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // SVG drop-shadow for green
  let filter = isGreen ? "drop-shadow(0 0 10px #22C55E)" : "none";

  // Pulsing glow for center number
  let pulseClass = isGreen ? "animate-green-pulse" : "";

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: size, height: size, position: 'relative' }}>
      {/* When Presage integration is complete, score prop will be 
          calculated from live sensor data in SessionRecap.jsx */}
      <svg width={size} height={size} style={{ filter }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke 0.2s" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ top: 0, left: 0, width: size, height: size, pointerEvents: 'none' }}>
        <span
          className={`font-bold text-5xl select-none ${pulseClass}`}
          style={{ color: ringColor }}
        >
          {animatedScore}
        </span>
        <span className="text-sm mt-1" style={{ color: "#64748B" }}>Score</span>
      </div>
      {/* Green pulsing keyframes */}
      <style>{`
        @keyframes green-pulse {
          0% { text-shadow: 0 0 0 #22C55E; }
          50% { text-shadow: 0 0 18px #22C55E, 0 0 36px #22C55E44; }
          100% { text-shadow: 0 0 0 #22C55E; }
        }
        .animate-green-pulse {
          animation: green-pulse 1.2s infinite;
        }
      `}</style>
    </div>
  );
}

export default CircularScoreBar;
