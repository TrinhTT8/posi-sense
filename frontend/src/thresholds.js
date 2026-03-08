// src/thresholds.js
// All metric thresholds and helper for status lookup

export const THRESHOLDS = {
  eyeContact: {
    unit: "% of session time looking at camera",
    populationBaseline: 72,
    ranges: {
      red:    { min: 0,   max: 49,  label: "Avoidant",   message: "Maintain more eye contact with the camera — you appear disengaged.", color: "red" },
      amber:  { min: 50,  max: 64,  label: "Low",        message: "Try to look at the camera lens more consistently.", color: "amber" },
      green:  { min: 65,  max: 80,  label: "Confident",  message: "Strong eye contact — keep it up.", color: "green" },
      amber2: { min: 81,  max: 90,  label: "Intense",    message: "Slightly intense — look away naturally once in a while.", color: "amber" },
      red2:   { min: 91,  max: 100, label: "Unnatural",  message: "Too much unblinking eye contact can feel uncomfortable — relax.", color: "red" }
    }
  },
  blinkRate: {
    unit: "blinks per minute (BPM)",
    populationBaseline: 17,
    ranges: {
      red:   { min: 0,  max: 7,  label: "Freezing",   message: "Very low blink rate — you may be freezing up or in cognitive overload.", color: "red" },
      amber: { min: 8,  max: 11, label: "Low",        message: "Slightly low blink rate — try to stay relaxed.", color: "amber" },
      green: { min: 12, max: 20, label: "Normal",     message: "Blink rate is natural and calm.", color: "green" },
      amber2:{ min: 21, max: 28, label: "Elevated",   message: "Elevated blinking detected — a common anxiety signal. Try a slow breath.", color: "amber" },
      red2:  { min: 29, max: 999,label: "Stressed",   message: "High blink rate suggests significant stress. Pause and breathe before answering.", color: "red" }
    }
  },
  speakingPace: {
    unit: "words per minute (WPM)",
    populationBaseline: 145,
    ranges: {
      red:   { min: 0,   max: 99,  label: "Too Slow",  message: "Speaking too slowly — you may come across as uncertain or disengaged.", color: "red" },
      amber: { min: 100, max: 119, label: "Slow",      message: "Slightly slow pace — try to speak a little more energetically.", color: "amber" },
      green: { min: 120, max: 165, label: "Confident", message: "Great speaking pace — clear and easy to follow.", color: "green" },
      amber2:{ min: 166, max: 185, label: "Fast",      message: "You're speaking quickly — slow down slightly to sound more deliberate.", color: "amber" },
      red2:  { min: 186, max: 999, label: "Rushing",   message: "You're rushing — take a breath and slow down. Fast speech signals anxiety.", color: "red" }
    }
  },
  fillerWords: {
    unit: "count per answer",
    populationBaseline: 3,
    ranges: {
      green: { min: 0, max: 3,   label: "Clean",    message: "Minimal filler words — your speech sounds polished.", color: "green" },
      amber: { min: 4, max: 7,   label: "Moderate", message: "A few filler words crept in — try replacing 'um' with a deliberate pause.", color: "amber" },
      red:   { min: 8, max: 999, label: "Frequent", message: "Too many filler words — silence sounds more confident than 'um'.", color: "red" }
    }
  },
  expression: {
    unit: "dominant tone % of session",
    populationBaseline: "engaged",
    ranges: {
      green: { tone: "engaged",  threshold: 60, message: "You appeared engaged and present throughout.", color: "green" },
      amber: { tone: "neutral",  threshold: 40, message: "Your expression was quite flat — try to animate your face slightly.", color: "amber" },
      amber2:{ tone: "tense",    threshold: 20, message: "You appeared tense during parts of this answer — a slight smile helps.", color: "amber" },
      red:   { tone: "stressed", threshold: 15, message: "Visible stress signals detected — breathe and try to relax your face.", color: "red" }
    }
  },
  overallScore: {
    ranges: {
      red:   { min: 0,  max: 49, label: "Needs Work", color: "red" },
      amber: { min: 50, max: 69, label: "Developing", color: "amber" },
      green: { min: 70, max: 89, label: "Strong", color: "green" },
      gold:  { min: 90, max: 100,label: "Exceptional", color: "gold" }
    }
  }
};

export function getThresholdStatus(metric, value) {
  const t = THRESHOLDS[metric];
  if (!t) return null;
  if (metric === "expression") {
    // Find dominant tone and threshold
    const { scores } = value;
    const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const percent = scores[dominant];
    for (const key of ["green", "amber", "amber2", "red"]) {
      const r = t.ranges[key];
      if (r.tone === dominant && percent >= r.threshold) return { ...r, value: percent, dominant };
    }
    // If not matching, return amber
    return { ...t.ranges.amber, value: percent, dominant };
  } else {
    for (const key of Object.keys(t.ranges)) {
      const r = t.ranges[key];
      if (value >= r.min && value <= r.max) return { ...r, value };
    }
  }
  return null;
}
