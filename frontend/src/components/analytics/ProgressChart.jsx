import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from "recharts";
import { HiOutlineChartBar } from "react-icons/hi2";

// sessions prop comes from GET /api/sessions/:userId
// fetched in SessionRecap.jsx on mount

const METRICS = [
  {
    key: "overall",
    label: "Overall",
    color: "#0F172A",
    dot: "#0F172A",
    strokeWidth: 2.5,
    alwaysOn: true,
    anim: 0
  },
  {
    key: "eyeContact",
    label: "Eye Contact",
    color: "#0D9488",
    dot: "#0D9488",
    strokeWidth: 2,
    alwaysOn: false,
    anim: 150
  },
  {
    key: "blinkRate",
    label: "Blink Rate",
    color: "#8B5CF6",
    dot: "#8B5CF6",
    strokeWidth: 2,
    alwaysOn: false,
    anim: 300
  },
  {
    key: "pace",
    label: "Pace",
    color: "#F59E0B",
    dot: "#F59E0B",
    strokeWidth: 2,
    alwaysOn: false,
    anim: 450
  },
  {
    key: "expression",
    label: "Expression",
    color: "#10B981",
    dot: "#10B981",
    strokeWidth: 2,
    alwaysOn: false,
    anim: 600
  }
];

function getBlinkScore(bpm) {
  const baseline = 17;
  const diff = Math.abs(bpm - baseline);
  return Math.max(0, Math.min(100, 100 - diff * 3));
}
function getPaceScore(wpm) {
  const baseline = 145;
  const diff = Math.abs(wpm - baseline);
  return Math.max(0, Math.min(100, 100 - diff * 2));
}

function CustomTooltip({ active, payload, label, visibleMetrics }) {
  if (!active || !payload || !payload.length) return null;
  const session = payload[0].payload;
  return (
    <div className="shadow-lg rounded-lg px-4 py-3" style={{ background: "#0F172A", color: "#fff", minWidth: 180 }}>
      <div className="font-bold mb-2">{session.name}</div>
      {METRICS.filter(m => visibleMetrics[m.key]).map(m => (
        <div key={m.key} className="flex items-center gap-2 mb-1">
          <span style={{ background: m.dot, width: 10, height: 10, borderRadius: "50%", display: "inline-block" }} />
          <span>{m.label}:</span>
          <span className="font-mono">{session[m.key]}</span>
        </div>
      ))}
    </div>
  );
}

function ProgressChart({ sessions }) {
  const [visible, setVisible] = useState({
    overall: true,
    eyeContact: true,
    blinkRate: true,
    pace: true,
    expression: true
  });

  // Prepare data
  const data = useMemo(() => {
    if (!sessions || sessions.length < 2) return [];
    return [...sessions].reverse().map((s, i, arr) => ({
      name: `Session ${i + 1}`,
      overall: s.overallScore,
      eyeContact: s.eyeContact?.score ?? null,
      blinkRate: getBlinkScore(s.blinkRate?.average ?? 0),
      pace: getPaceScore(s.speakingPace?.averageWPM ?? 0),
      expression: s.expression?.scores?.engaged ?? null
    }));
  }, [sessions]);

  // Toggle handler
  function toggleMetric(key) {
    if (METRICS.find(m => m.key === key).alwaysOn) return;
    setVisible(v => ({ ...v, [key]: !v[key] }));
  }

  if (!sessions || sessions.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[320px] w-full">
        <HiOutlineChartBar className="text-4xl mb-2 text-[#94A3B8]" />
        <div className="italic text-[#94A3B8] text-center">Complete at least 2 sessions to see your progress.</div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: 320 }}>
      <div className="text-xs font-bold uppercase mb-1" style={{ color: "#64748B" }}>Progress Over Time</div>
      <div className="text-xs mb-3" style={{ color: "#94A3B8" }}>Your last sessions at a glance</div>
      {/* Toggle pills */}
      <div className="flex gap-2 mb-2">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => toggleMetric(m.key)}
            disabled={m.alwaysOn}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition
              ${visible[m.key] ? '' : 'border-[#CBD5E1] text-[#64748B] bg-white'}
              ${visible[m.key] && !m.alwaysOn ? '' : ''}
              ${visible[m.key] && m.alwaysOn ? `bg-[${m.color}] text-white border-transparent` : ''}
              ${visible[m.key] && !m.alwaysOn ? `bg-[${m.color}] text-white border-transparent` : ''}
              ${m.alwaysOn ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={visible[m.key] ? { background: m.color, color: '#fff', border: 'none' } : { background: '#fff', color: '#64748B', border: '1px solid #CBD5E1' }}
          >
            <span style={{ background: m.dot, width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
            {m.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} />
          <Tooltip content={<CustomTooltip visibleMetrics={visible} />} />
          <ReferenceLine y={70} stroke="#0D9488" strokeDasharray="4 4" label={{ value: 'Unlock Threshold', position: 'right', fill: '#0D9488', fontSize: 12, fontWeight: 600 }} />
          {METRICS.map(m => visible[m.key] && (
            <Line
              key={m.key}
              type="monotone"
              dataKey={m.key}
              stroke={m.color}
              strokeWidth={m.strokeWidth}
              dot={{ r: 4, stroke: m.color, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              animationDuration={1200}
              animationBegin={m.anim}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProgressChart;
