

import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

// Fish index based on PNGs in assets (add more as needed)
const FISH_INDEX = [
  { name: "Anchovy", img: "/assets/Anchovy.png" },
  { name: "Angelfish", img: "/assets/Angelfish.png" },
  { name: "Bass", img: "/assets/Bass.png" },
  { name: "Catfish", img: "/assets/Catfish.png" },
  { name: "Clownfish", img: "/assets/Clownfish.png" },
  { name: "Dungeness Crab", img: "/assets/Dungeness%20Crab.png" },
  { name: "Goldfish", img: "/assets/Goldfish.png" },
  { name: "Pufferfish", img: "/assets/Pufferfish.png" },
  { name: "Rainbow Trout", img: "/assets/Rainbow%20Trout.png" },
  { name: "Surgeonfish", img: "/assets/Surgeonfish.png" },
];

export default function AquariumView() {
  const navigate = useNavigate();
  const { user, progress } = useAuth();
  // Only show unlocked fish if present in progress.aquarium (array of names)
  const unlockedItems = (progress?.aquarium && Array.isArray(progress.aquarium))
    ? progress.aquarium
    : [];
  const lockedFish = FISH_INDEX.filter(f => !unlockedItems.includes(f.name));
  const sessionCount = progress?.totalSessions || 0;

  return (
    <div 
      className="min-h-screen flex flex-col py-8 px-12 bg-[#F8FAFC]"
      style={{ background: "linear-gradient(180deg, #c6ebf1 0%, #d6f8f6 60%, #b4c9cc 100%)" }}
    >
      {/* Header */}
      <header className="relative flex items-center justify-between mb-8 w-full max-w-6xl mx-auto" style={{ minHeight: 56 }}>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors text-lg font-medium z-10"
        >
          ← <span>Back</span>
        </button>
        {/* Centered header absolutely, always centered on screen */}
        <h2
          className="text-3xl text-[#0F172A] font-bold logo-font text-center absolute left-1/2 -translate-x-1/2 w-full pointer-events-none"
          style={{ top: 0 }}
        >
          My Aquarium
        </h2>
        <div className="text-[#64748B] text-base z-10" style={{ minWidth: 120, textAlign: 'right' }}>{sessionCount} sessions · {unlockedItems.length} unlocks</div>
      </header>

      {/* Main Aquarium Tank */}
      <div className="flex-1 flex items-center justify-center mb-8 w-full">
        <div 
          className="bg-gradient-to-b from-[#E0F2FE] to-[#BAE6FD] rounded-[24px] p-8 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          style={{ width: "90%", maxWidth: "1200px", height: "70vh", minHeight: "500px" }}
        >
          {/* ...removed SVG border for cleaner look... */}
          {/* Subtle paper texture overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 2,
              opacity: 0.12,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\' fill=\'%230ea5e9\'/\%3E%3C/svg%3E")',
              backgroundRepeat: 'repeat',
            }}
          />
          {/* Tank content area: show unlocked fish PNGs */}
          <div className="relative w-full h-full flex items-center justify-center" style={{ zIndex: 3 }}>
            {unlockedItems.length > 0 ? (
              FISH_INDEX.filter(f => unlockedItems.includes(f.name)).map((fish, i) => (
                <img
                  key={fish.name}
                  src={fish.img}
                  alt={fish.name}
                  className="mx-4"
                  style={{
                    width: 90,
                    height: 62,
                    zIndex: 4,
                    filter: 'drop-shadow(0 2px 8px #0ea5e955)',
                    transition: 'transform 0.5s',
                  }}
                  draggable={false}
                  title={fish.name}
                />
              ))
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[#64748B] text-xl mb-3">Your aquarium is empty</p>
                <p className="text-[#94A3B8] text-sm">Score above 70% in practice sessions to unlock new items</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Locked Collection Strip */}
      <div className="max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <p className="text-[#64748B] text-sm mb-4">Locked Fish</p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {lockedFish.map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-20 h-20 bg-[#F8FAFC] rounded-xl border-2 border-[#E2E8F0] flex items-center justify-center relative group opacity-80 overflow-hidden"
              >
                {/* Generic shadow or lock icon for locked fish */}
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <ellipse cx="12" cy="16" rx="10" ry="6" fill="#CBD5E1" opacity="0.5" />
                    <rect x="7" y="8" width="10" height="8" rx="3" fill="#CBD5E1" />
                    <rect x="10" y="5" width="4" height="4" rx="2" fill="#CBD5E1" opacity="0.7" />
                  </svg>
                </div>
                {/* Lock icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="6" y="10" width="12" height="8" rx="3" fill="#94A3B8"/><rect x="9" y="7" width="6" height="6" rx="3" fill="#94A3B8" opacity="0.7"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <p className="text-[#94A3B8] text-sm text-center mt-6">
        Practice and score above 70% to unlock new additions
      </p>

      <style>{`
        @keyframes swim {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(10px) translateY(-5px); }
          50% { transform: translateX(0) translateY(-10px); }
          75% { transform: translateX(-10px) translateY(-5px); }
        }

        @keyframes bubble-float {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
        }

        .animate-swim {
          animation: swim 8s ease-in-out infinite;
        }

        .animate-bubble-float {
          animation: bubble-float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
