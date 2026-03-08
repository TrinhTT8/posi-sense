import React, { useEffect, useRef, useState } from "react";
import { THRESHOLDS, getThresholdStatus } from "../../thresholds";

// value prop will come from Presage live sensor output
// routed through SessionRecap.jsx when integration is complete

const METRIC_RANGES = {
  eyeContact: { min: 0, max: 100 },
  blinkRate: { min: 0, max: 40 },
  speakingPace: { min: 0, max: 220 },
  fillerWords: { min: 0, max: 15 },
  expression: { min: 0, max: 1 }, // always 100% fill
};

function getFillPercent(metric, value) {
  if (metric === "expression") return 100;
  const range = METRIC_RANGES[metric] || { min: 0, max: 100 };
  const pct = ((value - range.min) / (range.max - range.min)) * 100;
  return Math.max(0, Math.min(100, pct));
}


const COLOR_MAP = {
  green: "#0D9488",
  amber: "#F59E0B",
  red: "#EF4444",
  gold: "#F59E0B"
};

function MetricCard({ metric, value, label, unit }) {
  const [fill, setFill] = useState(0);
  const barRef = useRef();
  const threshold = getThresholdStatus(metric, value);
  const fillColor = COLOR_MAP[threshold.color] || threshold.color;

  useEffect(() => {
    setFill(0);
    const timeout = setTimeout(() => {
      setFill(getFillPercent(metric, value));
    }, 20);
    return () => clearTimeout(timeout);
  }, [metric, value]);

  // Min/max labels
  let minLabel = "";
  let maxLabel = "";
  if (metric === "eyeContact") { minLabel = "0%"; maxLabel = "100%"; }
  else if (metric === "blinkRate") { minLabel = "0"; maxLabel = "40"; }
  else if (metric === "speakingPace") { minLabel = "0"; maxLabel = "220"; }
  else if (metric === "fillerWords") { minLabel = "0"; maxLabel = "15"; }
  else if (metric === "expression") { minLabel = ""; maxLabel = ""; }

  return (
    <div className="bg-white rounded-xl shadow transition-all duration-200 p-5 w-64 hover:shadow-lg hover:-translate-y-0.5 select-none">
      <div className="mb-3">
        <div className="font-bold text-[16px] text-[#0F172A]">{label}</div>
        <div className="flex items-end gap-2 mt-1">
          <span className="font-bold text-[32px]" style={{ color: fillColor }}>{value}</span>
          <span className="text-xs text-[#94A3B8] mb-1">{unit}</span>
        </div>
      </div>
      <div className="mb-2">
        <div className="w-full h-[6px] bg-[#E2E8F0] rounded-full relative overflow-hidden">
          <div
            ref={barRef}
            className="h-full rounded-full transition-all duration-800"
            style={{ width: `${fill}%`, background: fillColor, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-[#94A3B8]">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span style={{ background: fillColor, width: 8, height: 8, borderRadius: "50%", display: "inline-block" }} />
        <span className="italic text-[13px] text-[#64748B]">{threshold.message}</span>
      </div>
    </div>
  );
}

export default MetricCard;
