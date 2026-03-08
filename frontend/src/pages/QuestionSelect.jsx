import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const questions = {
  Behavioral: [
    "What is your biggest strength and weakness?",
    "Tell me about a time when you had to deal with a difficult stakeholder. How did you handle the situation?",
    "Describe a situation where you had to work with a team member who wasn't pulling their weight. What did you do?",
    "Give me an example of a time when you had to adapt to a significant change at work. How did you manage it?",
  ],
  Situational: [
    "If you were assigned to a project with unclear requirements and a tight deadline, how would you approach it?",
    "Imagine a key team member suddenly leaves during a critical project phase. What would you do?",
    "You discover a major bug in production right before a weekend. How would you handle this situation?",
  ],
  Technical: [
    "Explain the difference between SQL and NoSQL databases. When would you use each?",
    "How would you optimize the performance of a slow-loading web application?",
    "Walk me through how you would design a URL shortening service like bit.ly.",
  ],
};

export default function QuestionSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const category = (searchParams.get("category") || "Behavioral");
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const categoryQuestions = questions[category] || questions.Behavioral;

  const handleBack = () => {
    navigate("/");
  };

  const handleStartPractice = () => {
    if (selectedQuestion) {
      navigate(`/practice?question=${encodeURIComponent(selectedQuestion)}&category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-12 py-8 flex items-center justify-between">
        <h1 className="text-[#0F172A] logo-font">PosiSense</h1>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-12 pb-12">
        <div className="w-full max-w-4xl">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#F0FDFA] text-[#0D9488] rounded-full px-4 py-2 mb-4">
              <span>{category}</span>
            </div>
            <h2 className="text-4xl mb-3 text-[#0F172A]">Select a Question</h2>
            <p className="text-[#64748B]">Choose a question to practice your interview skills</p>
          </div>

          {/* Question Cards */}
          <div className="space-y-4 mb-10">
            {categoryQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setSelectedQuestion(question)}
                className={`w-full text-left bg-white rounded-[16px] p-8 transition-all ${
                  selectedQuestion === question
                    ? "shadow-[0_8px_32px_rgba(13,148,136,0.15)] ring-2 ring-[#0D9488]"
                    : "shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F8FAFC] text-[#64748B] flex items-center justify-center mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#0F172A] text-lg leading-relaxed">{question}</p>
                  </div>
                  {selectedQuestion === question && (
                    <CheckCircle2 className="w-6 h-6 text-[#0D9488] flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Start Practice Button */}
          <button
            onClick={handleStartPractice}
            disabled={!selectedQuestion}
            className={`w-full rounded-xl px-8 py-5 transition-all ${
              selectedQuestion
                ? "bg-[#0D9488] text-white hover:bg-[#0F766E] shadow-[0_4px_16px_rgba(13,148,136,0.2)]"
                : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
            }`}
          >
            {selectedQuestion ? "Start Practice" : "Select a question to continue"}
          </button>
        </div>
      </main>
    </div>
  );
}