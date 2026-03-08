import { useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";

// Placeholder for unlocked item logic
const getRewardItem = (score) => {
  if (score >= 90) return { name: "Jellyfish", type: "special", label: "Jellyfish" };
  if (score >= 80) return { name: "RareFish", type: "rare", label: "Mandarinfish" };
  return { name: "Clownfish", type: "common", label: "Clownfish" };
};

export default function AquariumUnlock() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const score = parseInt(searchParams.get("score") || "0", 10);
  const [showHeadline, setShowHeadline] = useState(false);
  const [showTank, setShowTank] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const reward = getRewardItem(score);

  useEffect(() => {
    setTimeout(() => setShowHeadline(true), 400);
    setTimeout(() => setShowTank(true), 1200);
    setTimeout(() => setShowReward(true), 2200);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0C4A6E 0%, #0A1628 100%)" }} className="flex flex-col items-center justify-center">
      {/* Headline */}
      {showHeadline && (
        <div className="fade-in mb-8 text-center">
          <h2 className="text-4xl text-white font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>You earned a new addition.</h2>
          <p className="text-lg text-white/80">Your score: {score}% — above the 70% threshold to unlock.</p>
        </div>
      )}
      {/* Aquarium Tank */}
      {showTank && (
        <div className="fade-in flex flex-col items-center">
          <div className="relative rounded-[40px] overflow-hidden" style={{ width: 800, height: 460, background: "linear-gradient(180deg, #1E293B 0%, #0A1628 100%)", boxShadow: "0 8px 48px #0A1628" }}>
            {/* TODO: Render existing unlocked items here */}
            {/* Animated new item */}
            {showReward && (
              <div className="absolute animate-reward-in" style={{ right: 0, top: 180 }}>
                {/* Replace with SVG/illustration for each reward */}
                <img src={`/assets/aquarium/${reward.name}.svg`} alt={reward.label} style={{ width: 120, height: 80 }} />
              </div>
            )}
            {/* TODO: Animate fish/coral, gentle movement */}
          </div>
          {/* Label for new item */}
          {showReward && (
            <div className="mt-6 text-white text-lg fade-in">
              {reward.label} added to your aquarium.
            </div>
          )}
        </div>
      )}
      {/* Action Buttons */}
      {showReward && (
        <div className="flex gap-6 mt-12 fade-in">
          <button onClick={() => navigate("/aquarium")} className="bg-[#0D9488] text-white rounded-xl px-8 py-5 text-lg font-medium shadow-lg hover:bg-[#0F766E] transition-all">View My Aquarium</button>
          <button onClick={() => navigate("/")} className="border-2 border-[#0D9488] text-[#0D9488] bg-transparent rounded-xl px-8 py-5 text-lg font-medium hover:bg-[#F0FDFA] transition-all">Back to Home</button>
        </div>
      )}
    </div>
  );
}
