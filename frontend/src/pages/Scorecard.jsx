import { useNavigate, useLocation } from "react-router";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Scorecard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, saveSession } = useAuth();

  // Pull real stats passed from Practice, fall back to demo values if navigated directly
  const { stats, question, category } = location.state || {};
  const s = stats || {
    eyeContact: 78, eyeContactTrend: "up", eyeContactChange: "+5%",
    fillerWords: 12, fillerTrend: "down", fillerChange: "-3",
    wpm: 142, paceTrend: "neutral", paceChange: "±0",
    expressionScore: 8.5, expressionTrend: "up", expressionChange: "+0.5",
    overallScore: 82,
  };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const metrics = [
    {
      label: "Eye Contact",
      value: `${s.eyeContact}%`,
      trend: s.eyeContactTrend,
      change: s.eyeContactChange,
    },
    {
      label: "Filler Words",
      value: `${s.fillerWords}`,
      trend: s.fillerTrend,
      change: s.fillerChange,
    },
    {
      label: "Speaking Pace",
      value: `${s.wpm} wpm`,
      trend: s.paceTrend,
      change: s.paceChange,
    },
    {
      label: "Expression Score",
      value: `${s.expressionScore}/10`,
      trend: s.expressionTrend,
      change: s.expressionChange,
    },
  ];

  // Dynamic insight based on actual weakest metric
  const getInsight = () => {
    if (s.eyeContact < 60) return "Low eye contact detected — especially in the first 15 seconds. Try fixing your gaze on the camera lens before you start speaking.";
    if (s.fillerWords > 15) return `You used ${s.fillerWords} filler words this round. Practice pausing silently instead of filling with "um" or "like".`;
    if (s.wpm > 155) return "You were speaking faster than ideal. Slow down slightly — pausing between points makes you sound more confident.";
    if (s.nervousSpikes > 1) return "A couple of composure dips were detected. Try taking one slow breath before you start your answer.";
    return "Solid performance! Your eye contact and pace were consistent. Keep building on this foundation.";
  };

  const handleNextQuestion = () => {
    const sessionData = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      category: category || "Behavioral",
      question: question || "Sample question",
      score: s.overallScore,
      metrics: {
        eyeContact: s.eyeContact,
        fillerWords: s.fillerWords,
        pace: `${s.wpm} wpm`,
        expression: s.expressionScore,
      },
    };
    saveSession(sessionData);
    navigate("/session-recap");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-12 py-8">
        <h1 className="text-[#0F172A] logo-font">PosiSense</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-12 pb-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-2 text-[#0F172A]">Answer Review</h2>
            <p className="text-[#64748B]">Here's how you performed on that question</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            {metrics.map((metric) => (
              <MetricTile key={metric.label} {...metric} />
            ))}
          </div>

          <div className="bg-gradient-to-br from-[#F0FDFA] to-[#ECFDF5] rounded-[16px] p-8 mb-10 border-l-4 border-[#0D9488]">
            <p className="text-sm text-[#0D9488] mb-2">💡 Key Insight</p>
            <p className="text-[#0F172A] text-lg leading-relaxed">{getInsight()}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/practice")}
              className="flex-1 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl px-8 py-5 hover:border-[#0D9488] hover:bg-[#F0FDFA] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleNextQuestion}
              className="flex-1 bg-[#0D9488] text-white rounded-xl px-8 py-5 hover:bg-[#0F766E] transition-colors shadow-[0_4px_16px_rgba(13,148,136,0.2)]"
            >
              Next Question
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricTile({ label, value, trend, change }) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-5 h-5 text-[#10B981]" />;
    if (trend === "down") return <TrendingDown className="w-5 h-5 text-[#EF4444]" />;
    return <Minus className="w-5 h-5 text-[#64748B]" />;
  };
  const getTrendColor = () => {
    if (trend === "up") return "text-[#10B981]";
    if (trend === "down") return "text-[#EF4444]";
    return "text-[#64748B]";
  };

  return (
    <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow">
      <p className="text-[#64748B] mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-5xl text-[#0F172A]">{value}</p>
        <div className="flex items-center gap-2 mb-2">
          {getTrendIcon()}
          <p className={getTrendColor()}>{change}</p>
        </div>
      </div>
    </div>
  );
}
