import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function AquariumView() {
  const navigate = useNavigate();
  const { user, progress } = useAuth();
  // Placeholder: unlockedItems and sessionCount would come from user progress
  const unlockedItems = [
    { name: "Clownfish", label: "Clownfish", date: "2026-03-07" },
    { name: "Mandarinfish", label: "Mandarinfish", date: "2026-03-06" },
  ];
  const lockedCount = 8;
  const sessionCount = 12;

  // Drag-and-drop state (not implemented yet)
  const [positions, setPositions] = useState(unlockedItems.map((_, i) => ({ x: 80 + i * 120, y: 300 })));

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0C4A6E 0%, #0A1628 100%)" }} className="flex flex-col items-center">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl pt-10 pb-6 px-8">
        <button onClick={() => navigate("/")} className="text-white text-lg font-medium">←</button>
        <h2 className="text-3xl text-white font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>My Aquarium</h2>
        <div className="text-white/80 text-base">{sessionCount} sessions · {unlockedItems.length} unlocks</div>
      </div>
      {/* Aquarium Tank */}
      <div className="flex flex-col items-center w-full">
        <div className="relative rounded-[40px] overflow-hidden mb-8" style={{ width: '70vw', maxWidth: 1100, height: 520, background: "linear-gradient(180deg, #1E293B 0%, #0A1628 100%)", boxShadow: "0 8px 48px #0A1628" }}>
          {/* Render unlocked items */}
          {unlockedItems.map((item, i) => (
            <div key={item.name} className="absolute group" style={{ left: positions[i].x, top: positions[i].y, transition: 'left 0.8s, top 0.8s' }}>
              <img src={`/assets/aquarium/${item.name}.svg`} alt={item.label} style={{ width: 100, height: 70 }} />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-2.5rem] bg-[#0F172A] text-white text-xs rounded-lg px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label} — unlocked {item.date}
              </div>
            </div>
          ))}
          {/* TODO: Add drag-and-drop logic */}
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
      </div>
    </div>
  );
}
