// backend/models/Session.js
import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const FillerBreakdownSchema = new Schema({
  um: { type: Number, default: 0 },
  uh: { type: Number, default: 0 },
  like: { type: Number, default: 0 },
  youKnow: { type: Number, default: 0 }
}, { _id: false });

const SpeakingPaceSchema = new Schema({
  averageWPM: Number,
  peakWPM: Number,
  slowestWPM: Number,
  silences: [{ timestamp: Number, duration: Number }],
  fillerWords: {
    total: Number,
    breakdown: FillerBreakdownSchema,
    timestamps: [Number]
  }
}, { _id: false });

const BlinkRateSchema = new Schema({
  average: Number,
  baseline: Number,
  variance: Number,
  spikes: [{ timestamp: Number, rate: Number }]
}, { _id: false });

const EyeContactSchema = new Schema({
  score: Number,
  totalDuration: Number,
  onCameraSeconds: Number,
  offCameraSeconds: Number,
  longestLookAway: Number
}, { _id: false });

const ExpressionSchema = new Schema({
  dominantTone: String,
  scores: {
    engaged: Number,
    neutral: Number,
    tense: Number,
    stressed: Number
  },
  smileRate: Number,
  tensionSpikes: [{ timestamp: Number, intensity: Number }]
}, { _id: false });

const AquariumSchema = new Schema({
  fish: [String],
  coral: [String],
  decor: [String]
}, { _id: false });

const SessionSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  question: { type: String, required: true },
  category: { type: String, enum: ['behavioral', 'situational', 'technical'], required: true },
  duration: { type: Number, required: true },
  overallScore: { type: Number, required: true },
  eyeContact: { type: EyeContactSchema, required: true },
  blinkRate: { type: BlinkRateSchema, required: true },
  speakingPace: { type: SpeakingPaceSchema, required: true },
  expression: { type: ExpressionSchema, required: true },
  aquarium: { type: AquariumSchema, required: true }
}, { versionKey: false });

// Static: Get latest aquarium for user
SessionSchema.statics.getLatestAquarium = async function(userId) {
  const session = await this.findOne({ userId }).sort({ createdAt: -1 }).select('aquarium').lean();
  if (session && session.aquarium) return session.aquarium;
  return { fish: [], coral: [], decor: [] };
};

// Static: Get user baseline from last 5 sessions
SessionSchema.statics.getUserBaseline = async function(userId) {
  const sessions = await this.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();
  const avg = (arr, fn) => arr.length ? Math.round(arr.reduce((sum, s) => sum + fn(s), 0) / arr.length * 10) / 10 : 0;
  return {
    avgEyeContact: avg(sessions, s => s.eyeContact?.score || 0),
    avgBlinkRate: avg(sessions, s => s.blinkRate?.average || 0),
    avgWPM: avg(sessions, s => s.speakingPace?.averageWPM || 0),
    avgFillerWords: avg(sessions, s => s.speakingPace?.fillerWords?.total || 0),
    avgOverallScore: avg(sessions, s => s.overallScore || 0),
    sessionCount: sessions.length
  };
};

export default model('Session', SessionSchema);
