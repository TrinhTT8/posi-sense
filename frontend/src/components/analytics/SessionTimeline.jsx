import React, { useEffect, useRef, useState } from "react";

// spike data will come from real-time Presage detection events
// timestamped during the live session in TrainingMode.jsx

const SEVERITY_COLORS = {
  amber: "#F59E0B",
  red: "#EF4444"
};

const TYPE_LABELS = {
  eyeContact: "Eye Contact",
  blinkRate: "Blink Rate",
  speakingPace: "Speaking Pace",
  fillerWords: "Filler Words",
  expression: "Expression"
};

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SessionTimeline({ duration, spikes }) {
  const [barDrawn, setBarDrawn] = useState(false);
  const [dotVisible, setDotVisible] = useState([]);
  const [hovered, setHovered] = useState(null);
  const barRef = useRef();

  useEffect(() => {
    setBarDrawn(false);
    setDotVisible([]);
    // Animate bar
    const barTimeout = setTimeout(() => setBarDrawn(true), 20);
    // Animate dots after bar
    let dotTimeouts = [];
    if (spikes && spikes.length) {
      dotTimeouts = spikes.map((_, i) => setTimeout(() => {
        setDotVisible(v => {
          const arr = [...v];
          arr[i] = true;
          return arr;
        });
      }, 650 + i * 100));
    }
    return () => {
      clearTimeout(barTimeout);
      dotTimeouts.forEach(clearTimeout);
    };
  }, [spikes]);

  return (
    <div className="w-full px-4 py-6">
      <div className="text-xs font-bold uppercase mb-2" style={{ color: "#64748B" }}>Session Timeline</div>
      <div className="relative w-full" style={{ minHeight: 40 }}>
        {/* Timeline bar */}
        <div
          ref={barRef}
          className="bg-[#E2E8F0] rounded-full h-2 w-full overflow-visible"
          style={{
            width: barDrawn ? "100%" : "0%",
            transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
            position: "relative"
          }}
        >
          {/* Dots */}
          {spikes && spikes.length > 0 && spikes.map((spike, i) => {
            const left = `${(spike.timestamp / duration) * 100}%`;
            const color = SEVERITY_COLORS[spike.severity] || "#F59E0B";
            // Tooltip anchor logic
            const anchorRight = (spike.timestamp / duration) > 0.75;
            return (
              <div
                key={i}
                className="absolute"
                style={{ left, bottom: "50%", transform: "translate(-50%, 50%)", zIndex: 2 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  className="block"
                  style={{
                    width: 12, height: 12, borderRadius: "50%", background: color,
                    opacity: dotVisible[i] ? 1 : 0,
                    transform: dotVisible[i] ? "scale(1)" : "scale(0)",
                    transition: "opacity 0.3s, transform 0.3s",
                    boxShadow: `0 0 0 2px #fff, 0 2px 8px #0002`
                  }}
                />
                {/* Tooltip */}
                {hovered === i && (
                  <div
                    className="absolute"
                    style={{
                      bottom: 24,
                      left: anchorRight ? 'auto' : '50%',
                      right: anchorRight ? 0 : 'auto',
                      transform: anchorRight ? 'translateX(0)' : 'translateX(-50%)',
                      background: '#0F172A', color: '#fff', borderRadius: 12,
                      fontSize: 12, padding: '8px 12px', boxShadow: '0 4px 24px #0005',
                      whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
                      minWidth: 120, maxWidth: 220
                    }}
                  >
                    <div className="mb-1 font-mono text-xs" style={{ color: '#F1F5F9' }}>{formatTime(spike.timestamp)}</div>
                    <div className="mb-1">{spike.message}</div>
                    <div className="inline-block px-2 py-0.5 rounded bg-[#334155] text-xs" style={{ color: color, fontWeight: 600 }}>
                      {TYPE_LABELS[spike.type] || spike.type}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Empty state */}
        {(!spikes || spikes.length === 0) && (
          <div className="text-sm italic mt-3" style={{ color: "#94A3B8" }}>
            No significant issues detected this session.
          </div>
        )}
      </div>
      {/* Time labels */}
      <div className="flex justify-between mt-2 text-xs" style={{ color: "#94A3B8" }}>
        <span>0:00</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export default SessionTimeline;
