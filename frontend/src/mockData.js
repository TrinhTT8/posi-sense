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

export function generateMockSession(userId, question, category) {
  const createdAt = new Date();
  const duration = randomBetween(40, 120);

  // Eye contact
  const eyeContactScore = randomBetween(45, 95, 1);
  const onCameraSeconds = Math.round(duration * (eyeContactScore / 100));
  const offCameraSeconds = duration - onCameraSeconds;
  const longestLookAway = randomBetween(2, Math.min(12, offCameraSeconds), 1);

  // Blink rate
  const blinkAvg = randomBetween(8, 28, 1);
  const blinkVariance = Math.abs(blinkAvg - 17);
  const blinkSpikes = Array.from({ length: randomBetween(1, 3) }, () => ({
    timestamp: randomBetween(5, duration - 5),
    rate: randomBetween(20, 40, 1)
  }));
  // Blink rate score: 100 if 12-20, drops outside
  let blinkRateScore = 100;
  if (blinkAvg < 12) blinkRateScore = Math.max(0, 100 - (12 - blinkAvg) * 10);
  else if (blinkAvg > 20) blinkRateScore = Math.max(0, 100 - (blinkAvg - 20) * 7);

  // Speaking pace
  const avgWPM = randomBetween(105, 180, 1);
  const peakWPM = randomBetween(avgWPM, 190, 1);
  const slowestWPM = randomBetween(80, avgWPM, 1);
  const silences = Array.from({ length: randomBetween(0, 2) }, () => ({
    timestamp: randomBetween(5, duration - 5),
    duration: randomBetween(2, 8, 1)
  }));
  const fillerTotal = randomBetween(0, 10);
  const fillerBreakdown = {
    um: randomBetween(0, fillerTotal),
    uh: randomBetween(0, Math.max(0, fillerTotal - 2)),
    like: randomBetween(0, Math.max(0, fillerTotal - 3)),
    youKnow: randomBetween(0, Math.max(0, fillerTotal - 4))
  };
  const fillerTimestamps = Array.from({ length: fillerTotal }, () => randomBetween(2, duration - 2));
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
  const smileRate = randomBetween(10, 80, 1);
  const tensionSpikes = Array.from({ length: randomBetween(0, 2) }, () => ({
    timestamp: randomBetween(5, duration - 5),
    intensity: randomBetween(1, 10, 1)
  }));
  // Expression score: engaged% + (smileRate/2) - tense% - stressed%
  let expressionScore = scores.engaged + (smileRate / 2) - scores.tense - scores.stressed;
  expressionScore = Math.max(0, Math.min(100, Math.round(expressionScore)));

  // Overall score
  const overallScore = Math.round(
    (eyeContactScore * 0.35) + (blinkRateScore * 0.15) + (paceScore * 0.25) + (expressionScore * 0.25)
  );

  // Aquarium (mock: random fish/coral/decor)
  const fish = ["Clownfish", "Angelfish", "Bass", "Goldfish", "Pufferfish", "Catfish"];
  const coral = ["Anemone", "Brain Coral", "Sea Fan"];
  const decor = ["Treasure Chest", "Coral Rock"];
  const unlockedFish = fish.slice(0, randomBetween(1, fish.length));
  const unlockedCoral = coral.slice(0, randomBetween(0, coral.length));
  const unlockedDecor = decor.slice(0, randomBetween(0, decor.length));

  return {
    userId,
    createdAt,
    question,
    category,
    duration,
    overallScore,
    eyeContact: {
      score: eyeContactScore,
      totalDuration: duration,
      onCameraSeconds,
      offCameraSeconds,
      longestLookAway
    },
    blinkRate: {
      average: blinkAvg,
      baseline: 17,
      variance: blinkVariance,
      spikes: blinkSpikes
    },
    speakingPace: {
      averageWPM: avgWPM,
      peakWPM,
      slowestWPM,
      silences,
      fillerWords: {
        total: fillerTotal,
        breakdown: fillerBreakdown,
        timestamps: fillerTimestamps
      }
    },
    expression: {
      dominantTone,
      scores,
      smileRate,
      tensionSpikes
    },
    aquarium: {
      fish: unlockedFish,
      coral: unlockedCoral,
      decor: unlockedDecor
    }
  };
}
