// metric props will come from Presage sensor output
// passed down from TrainingMode.jsx when integrated
// currently accepts manual or mock values for testing
import React, { useEffect, useRef, useState } from "react";
import { THRESHOLDS, getThresholdStatus } from "../thresholds";

const METRIC_COLORS = {
  eyeContact: "#0D9488",
  blinkRate: "#8B5CF6",
  speakingPace: "#F59E0B",
  fillerCount: "#EF4444",
  expression: "#10B981"
};

function playPing(audioCtxRef) {
  try {
    let ctx = audioCtxRef.current;
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 440;
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

export default function LiveWarningSystem({
  isActive,
  eyeContact,
  blinkRate,
  speakingPace,
  fillerCount,
  expressionTone
}) {
  const [warnings, setWarnings] = useState([]);
  const lastWarningTime = useRef({
    eyeContact: 0,
    blinkRate: 0,
    speakingPace: 0,
    fillerCount: 0,
    expression: 0
  });
  const audioCtxRef = useRef(null);

  // Remove warning by id
  const dismissWarning = (id) => {
    setWarnings((ws) => ws.filter((w) => w.id !== id));
  };

  useEffect(() => {
    if (!isActive) return;
    const now = Date.now();
    const newWarnings = [];
    // Eye Contact
    if (
      getThresholdStatus("eyeContact", eyeContact, THRESHOLDS) === "red" &&
      now - lastWarningTime.current.eyeContact > 10000
    ) {
      newWarnings.push({
        id: `${now}-eyeContact`,
        metric: "eyeContact",
        message: "Look at your camera lens",
        color: METRIC_COLORS.eyeContact,
        timestamp: new Date()
      });
      lastWarningTime.current.eyeContact = now;
    }
    // Blink Rate
    if (
      blinkRate > 29 &&
      now - lastWarningTime.current.blinkRate > 10000
    ) {
      newWarnings.push({
        id: `${now}-blinkRate-high`,
        metric: "blinkRate",
        message: "Take a breath — you look stressed",
        color: METRIC_COLORS.blinkRate,
        timestamp: new Date()
      });
      lastWarningTime.current.blinkRate = now;
    } else if (
      blinkRate < 8 &&
      now - lastWarningTime.current.blinkRate > 10000
    ) {
      newWarnings.push({
        id: `${now}-blinkRate-low`,
        metric: "blinkRate",
        message: "Stay present — you may be freezing",
        color: METRIC_COLORS.blinkRate,
        timestamp: new Date()
      });
      lastWarningTime.current.blinkRate = now;
    }
    // Speaking Pace
    if (
      speakingPace > 186 &&
      now - lastWarningTime.current.speakingPace > 10000
    ) {
      newWarnings.push({
        id: `${now}-speakingPace-high`,
        metric: "speakingPace",
        message: "Slow down — you're rushing",
        color: METRIC_COLORS.speakingPace,
        timestamp: new Date()
      });
      lastWarningTime.current.speakingPace = now;
    } else if (
      speakingPace < 100 &&
      now - lastWarningTime.current.speakingPace > 10000
    ) {
      newWarnings.push({
        id: `${now}-speakingPace-low`,
        metric: "speakingPace",
        message: "Speak up — you sound uncertain",
        color: METRIC_COLORS.speakingPace,
        timestamp: new Date()
      });
      lastWarningTime.current.speakingPace = now;
    }
    // Filler Count
    if (
      getThresholdStatus("fillerCount", fillerCount, THRESHOLDS) === "red" &&
      now - lastWarningTime.current.fillerCount > 10000
    ) {
      newWarnings.push({
        id: `${now}-fillerCount`,
        metric: "fillerCount",
        message: "Pause instead of saying um",
        color: METRIC_COLORS.fillerCount,
        timestamp: new Date()
      });
      lastWarningTime.current.fillerCount = now;
    }
    // Expression Tone
    if (
      ["tense", "stressed"].includes(expressionTone) &&
      now - lastWarningTime.current.expression > 10000
    ) {
      newWarnings.push({
        id: `${now}-expression`,
        metric: "expression",
        message: "Relax your face — try a slight smile",
        color: METRIC_COLORS.expression,
        timestamp: new Date()
      });
      lastWarningTime.current.expression = now;
    }
    if (newWarnings.length > 0) {
      setWarnings((ws) => {
        const updated = [...ws, ...newWarnings];
        return updated.slice(-8); // keep a few extra for exit anim
      });
      playPing(audioCtxRef);
      // Auto-remove after 4s
      newWarnings.forEach((w) => {
        setTimeout(() => dismissWarning(w.id), 4000);
      });
    }
    // eslint-disable-next-line
  }, [isActive, eyeContact, blinkRate, speakingPace, fillerCount, expressionTone]);

  // Animation state for exit
  const [removingIds, setRemovingIds] = useState([]);
  const handleDismiss = (id) => {
    setRemovingIds((r) => [...r, id]);
    setTimeout(() => dismissWarning(id), 200);
  };

  // Only show 4 most recent, newest at bottom
  const visibleWarnings = warnings.slice(-4);

  return (
    <div
      className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 items-end"
      role="alert"
      aria-live="polite"
      style={{ minWidth: 280, maxWidth: 360 }}
    >
      {visibleWarnings.map((w) => (
        <div
          key={w.id}
          className={`flex items-center min-w-[280px] max-w-[360px] px-4 py-3 rounded-xl shadow-lg bg-[#1E293B] border-l-4 transition-all duration-300 ease-out ${removingIds.includes(w.id) ? "opacity-0 translate-x-full duration-200" : "opacity-100 translate-x-0"}`}
          style={{ borderColor: w.color, transform: removingIds.includes(w.id) ? "translateX(100%)" : "translateX(0)" }}
        >
          <span className="mr-3" style={{ width: 8, height: 8, background: w.color, borderRadius: 999, display: 'inline-block' }} />
          <span className="flex-1 text-white text-[13px]">{w.message}</span>
          <button
            className="ml-4 text-[#64748B] hover:text-white transition"
            style={{ fontSize: 18, lineHeight: 1 }}
            aria-label="Dismiss warning"
            onClick={() => handleDismiss(w.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
