import { useNavigate } from "react-router";
import { Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function SessionRecap() {
  const navigate = useNavigate();
  const { user, progress } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Don't render if no user
  if (!user) {
    return null;
  }

  const overallScore = 82;
  
  const timeline = [
    { time: "0:15", type: "eye-contact", color: "#EF4444" },
    { time: "0:45", type: "filler", color: "#F59E0B" },
    { time: "1:20", type: "good", color: "#10B981" },
    { time: "1:50", type: "filler", color: "#F59E0B" },
    { time: "2:30", type: "good", color: "#10B981" },
  ];

  const improvements = [
    {
      title: "Eye Contact Consistency",
      tip: "Practice maintaining eye contact during the opening 20 seconds",
      priority: 1,
    },
    {
      title: "Reduce Filler Words",
      tip: "Pause briefly instead of using 'um' or 'like'",
      priority: 2,
    },
    {
      title: "Speaking Pace",
      tip: "You're doing great — keep your current pace",
      priority: 3,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-12 py-8">
        <h1 className="text-[#0F172A] logo-font">PosiSense</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-12 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Title & Score */}
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-8 text-[#0F172A]">Session Complete</h2>
            
            {/* Circular Progress Ring */}
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - overallScore / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-6xl text-[#0F172A]">{overallScore}</p>
                  <p className="text-[#64748B]">Overall Score</p>
                </div>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] rounded-full px-6 py-3">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
              <p className="text-[#0F172A]">Personal Best! 🎉</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 mb-8">
            <h3 className="text-[#0F172A] mb-6">Session Timeline</h3>
            <div className="relative">
              {/* Base line */}
              <div className="h-2 bg-[#E2E8F0] rounded-full relative">
                {/* Flagged moments */}
                {timeline.map((moment, index) => (
                  <div
                    key={index}
                    className="absolute top-1/2 -translate-y-1/2 group"
                    style={{ left: `${(parseInt(moment.time.split(':')[0]) * 60 + parseInt(moment.time.split(':')[1])) / 180 * 100}%` }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
                      style={{ backgroundColor: moment.color }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-[#0F172A] text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap">
                        {moment.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3">
                <p className="text-sm text-[#64748B]">0:00</p>
                <p className="text-sm text-[#64748B]">3:00</p>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex gap-6 mt-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                <p className="text-sm text-[#64748B]">Eye Contact Drop</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <p className="text-sm text-[#64748B]">Filler Spike</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <p className="text-sm text-[#64748B]">Strong Moment</p>
              </div>
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 mb-8">
            <h3 className="text-[#0F172A] mb-6">Areas for Improvement</h3>
            <div className="space-y-4">
              {improvements.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[#0D9488] text-white rounded-full flex items-center justify-center">
                    {item.priority}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#0F172A] mb-1">{item.title}</p>
                    <p className="text-sm text-[#64748B]">{item.tip}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#0D9488] flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              // Navigate to unlock screen if score >= 70%, otherwise go home
              if (overallScore >= 70) {
                navigate(`/aquarium-unlock?score=${overallScore}`);
              } else {
                navigate("/");
              }
            }}
            className="w-full bg-[#0D9488] text-white rounded-xl px-8 py-5 hover:bg-[#0F766E] transition-colors shadow-[0_4px_16px_rgba(13,148,136,0.2)]"
          >
            {overallScore >= 70 ? "See Your Reward" : "Start New Session"}
          </button>
        </div>
      </main>
    </div>
  );
}