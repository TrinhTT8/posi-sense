

// Fetch aquarium from backend: GET /api/aquarium/:userId
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";


// All fish from assets folder
const FISH_INDEX = [
  { id: "fish_01", name: "Anchovy", img: "/assets/Anchovy.png", tier: "common" },
  { id: "fish_02", name: "Angelfish", img: "/assets/Angelfish.png", tier: "common" },
  { id: "fish_03", name: "Bass", img: "/assets/Bass.png", tier: "common" },
  { id: "fish_04", name: "Catfish", img: "/assets/Catfish.png", tier: "common" },
  { id: "fish_05", name: "Clownfish", img: "/assets/Clownfish.png", tier: "common" },
  { id: "fish_06", name: "Dungeness Crab", img: "/assets/Dungeness Crab.png", tier: "common" },
  { id: "fish_07", name: "Goldfish", img: "/assets/Goldfish.png", tier: "common" },
  { id: "fish_08", name: "Pufferfish", img: "/assets/Pufferfish.png", tier: "common" },
  { id: "fish_09", name: "Rainbow Trout", img: "/assets/Rainbow Trout.png", tier: "common" },
  { id: "fish_10", name: "Surgeonfish", img: "/assets/Surgeonfish.png", tier: "common" },
];
const LOCKED_ITEMS = [];

const TIER_COLORS = {
  common: ["#0D9488", "#CCFBF1", "#FFFFFF"],
  rare: ["#8B5CF6", "#E0E7FF", "#FFFFFF"],
  special: ["#F59E0B", "#FDE68A", "#FFFFFF"]
};

export function triggerUnlockAnimation(item) {
  const colors = TIER_COLORS[item.tier] || ["#0D9488", "#FFFFFF"];
  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.5 },
    colors,
  });
  // Overlay logic should be handled in AquariumView state
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const FISH_EMOJI = "🐠";
const CORAL_EMOJI = "🪸";
const RARE_CORAL_EMOJI = "🌺";
const SPECIAL_DECOR_EMOJI = "✨";
const LOCK_ICON = "🔒";

export default function AquariumView() {
  const navigate = useNavigate();
  const { user, progress } = useAuth();
  const [unlockedFish, setUnlockedFish] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5000/api/aquarium/${user.id}`)
      .then(res => res.json())
      .then(data => {
        // Sort by unlock date ascending
        const sorted = data
          .filter(item => item.type === 'fish')
          .sort((a, b) => new Date(a.dateUnlocked) - new Date(b.dateUnlocked));
        setUnlockedFish(sorted);
        setLoading(false);
      });
  }, [user]);

  // Map unlocked fish to FISH_INDEX for image/tier
  const displayFish = unlockedFish.map(f => {
    const fishMeta = FISH_INDEX.find(meta => meta.name === f.name);
    return {
      ...f,
      img: fishMeta ? fishMeta.img : '',
      tier: fishMeta ? fishMeta.tier : 'common',
    };
  });

  // Locked count
  const lockedCount = FISH_INDEX.length - displayFish.length;

  return (
    <div className="min-h-screen flex flex-col items-center px-12 py-12 bg-[#F8FAFC] transition-all duration-1000">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl mb-8">
        <button onClick={() => navigate("/")} className="border-2 border-[#0D9488] text-[#0D9488] bg-transparent rounded-xl px-6 py-2 font-medium hover:bg-[#F0FDFA] transition-all">Back to Home</button>
        <h1 className="text-[#0F172A] text-4xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>My Aquarium</h1>
        <div className="text-[#64748B] text-base">{progress?.totalSessions || 0} sessions · {displayFish.length} unlocks</div>
      </div>

      {/* Aquarium Tank */}
      <div className="bg-gradient-to-b from-[#E0F2FE] to-[#BAE6FD] rounded-[24px] p-8 mb-8 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]" style={{ width: "800px", height: "460px" }}>
        <div className="relative w-full h-full">
          {/* Fish with images */}
          {displayFish.map((fish, i) => {
            const left = 10 + (i * 80) % 600;
            const top = 60 + (i % 3) * 100;
            return (
              <img
                key={fish._id || fish.name}
                src={fish.img}
                alt={fish.name}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: 90,
                  height: 62,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px #0ea5e955)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                }}
                title={fish.name + (fish.dateUnlocked ? ` (Unlocked ${formatDate(fish.dateUnlocked)})` : '')}
                className="hover:scale-110"
              />
            );
          })}

          {/* Water effect - bubbles */}
          <div className="absolute bottom-10 left-10 animate-bubble-float">
            <div className="w-3 h-3 rounded-full bg-white/50"></div>
          </div>
          <div className="absolute bottom-20 right-20 animate-bubble-float" style={{ animationDelay: "1s" }}>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
          </div>
          <div className="absolute bottom-32 left-1/3 animate-bubble-float" style={{ animationDelay: "2s" }}>
            <div className="w-2.5 h-2.5 rounded-full bg-white/50"></div>
          </div>
        </div>
      </div>

      {/* Locked silhouettes strip */}
      <div className="flex gap-4 mb-8">
        {[...Array(lockedCount)].map((_, i) => (
          <div key={i} className="w-12 h-12 bg-[#0A1628] rounded-full flex items-center justify-center opacity-60">
            <span className="material-icons text-2xl text-[#64748B]">lock</span>
          </div>
        ))}
      </div>

      <div className="text-[#94A3B8] text-center mb-8">Practice and score above 70% to unlock new additions.</div>

      <style>{`
        @keyframes swim {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(10px) translateY(-5px); }
          50% { transform: translateX(0) translateY(-10px); }
          75% { transform: translateX(-10px) translateY(-5px); }
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        @keyframes bubble-float {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }

        .animate-swim {
          animation: swim 8s ease-in-out infinite;
        }

        .animate-sway {
          animation: sway 4s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .animate-bubble-float {
          animation: bubble-float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
