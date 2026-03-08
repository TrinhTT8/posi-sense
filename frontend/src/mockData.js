// src/mockData.js
// Generates realistic mock session data for PosiSense analytics UI

function randomBetween(min, max, decimals = 0) {
  const val = Math.random() * (max - min) + min;
  return decimals ? parseFloat(val.toFixed(decimals)) : Math.round(val);
}

function weightedRandom(weights) {
  // weights: [{ value, weight }]
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weights) {
    if (r < w.weight) return w.value;
    r -= w.weight;
  }
  return weights[weights.length - 1].value;
}

// Helper to round to 1 decimal place
function round1(val) {
  return Math.round(val * 10) / 10;
}

export function generateMockSession(userId, question, category) {
  const createdAt = new Date();
  const duration = randomBetween(40, 120);

  // Eye contact
  const eyeContactScore = randomBetween(45, 95, 1);
  const onCameraSeconds = round1(duration * (eyeContactScore / 100));
  const offCameraSeconds = round1(duration - onCameraSeconds);
  const longestLookAway = round1(randomBetween(2, Math.min(12, offCameraSeconds), 1));

  // Blink rate
  const blinkAvg = round1(randomBetween(8, 28, 1));
  const blinkVariance = round1(Math.abs(blinkAvg - 17));
  const blinkSpikes = Array.from({ length: randomBetween(1, 3) }, () => ({
    timestamp: round1(randomBetween(5, duration - 5)),
    rate: round1(randomBetween(20, 40, 1))
  }));
  // Blink rate score: 100 if 12-20, drops outside
  let blinkRateScore = 100;
  if (blinkAvg < 12) blinkRateScore = Math.max(0, 100 - (12 - blinkAvg) * 10);
  else if (blinkAvg > 20) blinkRateScore = Math.max(0, 100 - (blinkAvg - 20) * 7);

  // Speaking pace
  const avgWPM = round1(randomBetween(105, 180, 1));
  const peakWPM = round1(randomBetween(avgWPM, 190, 1));
  const slowestWPM = round1(randomBetween(80, avgWPM, 1));
  const silences = Array.from({ length: randomBetween(0, 2) }, () => ({
    timestamp: round1(randomBetween(5, duration - 5)),
    duration: round1(randomBetween(2, 8, 1))
  }));
  const fillerTotal = randomBetween(0, 10);
  const fillerBreakdown = {
    um: randomBetween(0, fillerTotal),
    uh: randomBetween(0, Math.max(0, fillerTotal - 2)),
    like: randomBetween(0, Math.max(0, fillerTotal - 3)),
    youKnow: randomBetween(0, Math.max(0, fillerTotal - 4))
  };
  const fillerTimestamps = Array.from({ length: fillerTotal }, () => round1(randomBetween(2, duration - 2)));
  // Pace score: 100 if 120-165, drops outside
  let paceScore = 100;
  if (avgWPM < 120) paceScore = Math.max(0, 100 - (120 - avgWPM) * 2);
  else if (avgWPM > 165) paceScore = Math.max(0, 100 - (avgWPM - 165) * 2.5);

  // Expression
  const tones = ["engaged", "neutral", "tense", "stressed"];
  const dominantTone = weightedRandom([
    { value: "engaged", weight: 0.5 },
    { value: "neutral", weight: 0.25 },
    { value: "tense", weight: 0.15 },
    { value: "stressed", weight: 0.1 }
  ]);
  const scores = {
    engaged: dominantTone === "engaged" ? randomBetween(60, 90) : randomBetween(10, 40),
    neutral: dominantTone === "neutral" ? randomBetween(40, 70) : randomBetween(5, 30),
    tense: dominantTone === "tense" ? randomBetween(20, 40) : randomBetween(0, 15),
    stressed: dominantTone === "stressed" ? randomBetween(15, 30) : randomBetween(0, 10)
  };
  // Normalize to 100
  const totalTone = scores.engaged + scores.neutral + scores.tense + scores.stressed;
  Object.keys(scores).forEach(k => { scores[k] = Math.round((scores[k] / totalTone) * 100); });
  const smileRate = round1(randomBetween(10, 80, 1));
  const tensionSpikes = Array.from({ length: randomBetween(0, 2) }, () => ({
    timestamp: round1(randomBetween(5, duration - 5)),
    intensity: round1(randomBetween(1, 10, 1))
  }));
  // Expression score: engaged% + (smileRate/2) - tense% - stressed%
  let expressionScore = round1(scores.engaged + (smileRate / 2) - scores.tense - scores.stressed);
  expressionScore = Math.max(0, Math.min(100, expressionScore));

  // Overall score
  let overallScore = (eyeContactScore * 0.35) + (blinkRateScore * 0.15) + (paceScore * 0.25) + (expressionScore * 0.25);
  overallScore = Math.min(100, Math.round(overallScore * 10) / 10);

  // Aquarium (mock: random fish/coral/decor)
  const fish = ["Clownfish", "Angelfish", "Bass", "Goldfish", "Pufferfish", "Catfish"];
  const coral = ["Anemone", "Brain Coral", "Sea Fan"];
  const decor = ["Treasure Chest", "Coral Rock"];
  const unlockedFish = fish.slice(0, randomBetween(1, fish.length));
  const unlockedCoral = coral.slice(0, randomBetween(0, coral.length));
  const unlockedDecor = decor.slice(0, randomBetween(0, decor.length));

  return {
    userId, // Real: user id from auth
    createdAt, // Real: session start time
    question, // Real: question asked
    category, // Real: category selected
    duration, // Real: session duration
    eyeContact: {
      score: eyeContactScore, // Real: % from face tracking
      totalDuration: duration, // Real: session duration
      onCameraSeconds, // Real: seconds looking at camera
      offCameraSeconds, // Real: seconds not looking at camera
      longestLookAway // Real: max consecutive seconds looking away
    },
    blinkRate: {
      average: blinkAvg, // Real: average BPM
      baseline: 17, // Real: population baseline
      variance: blinkVariance, // Real: deviation from baseline
      spikes: blinkSpikes // Real: detected blink spikes
    },
    speakingPace: {
      averageWPM: avgWPM, // Real: average WPM
      peakWPM, // Real: peak WPM
      slowestWPM, // Real: slowest WPM
      silences, // Real: detected silences
      fillerWords: {
        total: fillerTotal, // Real: total filler words
        breakdown: fillerBreakdown, // Real: breakdown by type
        timestamps: fillerTimestamps // Real: timestamps of fillers
      }
    },
    expression: {
      dominantTone, // Real: dominant tone
      scores, // Real: % for each tone
      smileRate, // Real: % of time smiling
      tensionSpikes // Real: detected tension spikes
    },
    aquarium: {
      fish: [], // Always start empty; unlock logic fills this later
      coral: [],
      decor: []
    },
    overallScore // Real: composite score
  };
}

// Add this function for generating multiple sessions
export function generateMultipleSessions(userId, count) {
  const SAMPLE_QUESTIONS = [
    { category: "Behavioral", question: "Tell me about a time you handled conflict at work." },
    { category: "Behavioral", question: "Describe a situation where you had to meet a tight deadline." },
    { category: "Situational", question: "What would you do if you disagreed with your manager?" },
    { category: "Situational", question: "How would you handle an angry customer?" },
    { category: "Technical", question: "Walk me through how you would debug a production issue." },
    { category: "Technical", question: "Explain a technical concept to a non-technical audience." }
  ];
  // Fisher-Yates shuffle
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const sessions = [];
  let questionsPool = shuffle(SAMPLE_QUESTIONS);
  let qIndex = 0;
  for (let i = 0; i < count; i++) {
    if (qIndex >= questionsPool.length) {
      questionsPool = shuffle(SAMPLE_QUESTIONS);
      qIndex = 0;
    }
    const { category, question } = questionsPool[qIndex++];
    sessions.push(generateMockSession(userId, question, category));
  }
  return sessions;
}

// test
console.log(generateMockSession('user123', 'Tell me about yourself', 'behavioral'))
console.log(generateMultipleSessions('user123', 3))
