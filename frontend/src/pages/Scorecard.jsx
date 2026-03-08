import { useNavigate } from "react-router";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Scorecard() {
  const navigate = useNavigate();
  const { user, saveSession, loading } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated, but only after loading
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-gray-400">Loading...</div>;
  }

  // TODO: Replace with real session/question data from backend or context
  const metrics = user && user.lastSessionMetrics ? user.lastSessionMetrics : [];

  const handleNextQuestion = () => {
    // Save session data before moving to next question (real implementation)
    // saveSession(realSessionData);
    navigate("/session-recap");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-12 py-8">
        <h1 className="text-[#0F172A] logo-font">PosiSense</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-12 pb-12">
        <div className="w-full max-w-4xl">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-2 text-[#0F172A]">Answer Review</h2>
            <p className="text-[#64748B]">Here's how you performed on that question</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            {metrics.map((metric) => (
              <MetricTile key={metric.label} {...metric} />
            ))}
          </div>

          {/* Insight Callout */}
          <div className="bg-gradient-to-br from-[#F0FDFA] to-[#ECFDF5] rounded-[16px] p-8 mb-10 border-l-4 border-[#0D9488]">
            <p className="text-sm text-[#0D9488] mb-2">💡 Key Insight</p>
            <p className="text-[#0F172A] text-lg leading-relaxed">
              You looked away most during the first 15 seconds — a common nerves pattern. Try taking a deep breath before starting.
            </p>
          </div>

          {/* Action Buttons */}
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

function MetricTile({ 
  label, 
  value, 
  trend, 
  change 
}) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-[#10B981]" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-[#EF4444]" />;
      default:
        return <Minus className="w-5 h-5 text-[#64748B]" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-[#10B981]";
      case "down":
        return "text-[#EF4444]";
      default:
        return "text-[#64748B]";
    }
  };

  return (
    <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow">
      <p className="text-[#64748B] mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-5xl text-[#0F172A]">{value}</p>
        <div className="flex items-center gap-2 mb-2">
          {getTrendIcon()}
          <p className={`${getTrendColor()}`}>{change}</p>
        </div>
      </div>
    </div>
  );
}