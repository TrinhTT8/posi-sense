// onComplete callback will trigger aquarium unlock 
// animation in AquariumView.jsx when built
import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

// Helper: Web Audio chime
function playChime(notes, interval) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  gain.connect(ctx.destination);
  let t = ctx.currentTime;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    osc.start(t + i * interval / 1000);
    osc.stop(t + i * interval / 1000 + 0.3);
    // Fade out
    gain.gain.setValueAtTime(0.15, t + i * interval / 1000 + 0.25);
    gain.gain.linearRampToValueAtTime(0, t + i * interval / 1000 + 0.3);
  });
  setTimeout(() => ctx.close(), notes.length * interval + 500);
}

const sparkleSVG = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="#F59E0B"/>
  </svg>
);


export default function ScoreCelebration({ score, onComplete }) {
  // No celebration for scores below 70
  if (score < 70) return null;
  const [show, setShow] = useState(true);
  const [exceptional, setExceptional] = useState(false);
  const timeouts = useRef([]);

  useEffect(() => {
    const isExceptional = score >= 90;
    setExceptional(isExceptional);
    // Chime
    if (isExceptional) {
      playChime([523, 659, 783, 987, 1046], 120);
    } else {
      playChime([523, 659, 783], 150);
    }
    // Confetti
    if (isExceptional) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#F59E0B", "#FCD34D", "#0D9488", "#FFFFFF", "#FEF3C7"]
      });
      // Side bursts after 600ms
      timeouts.current.push(setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.5 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.5 }
        });
      }, 600));
      // Auto dismiss after 6s
      timeouts.current.push(setTimeout(() => {
        setShow(false);
        onComplete && onComplete();
      }, 6000));
    } else {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4 },
        colors: ["#0D9488", "#CCFBF1", "#FFFFFF", "#5EEAD4"]
      });
      // Auto dismiss after 4s
      timeouts.current.push(setTimeout(() => {
        setShow(false);
        onComplete && onComplete();
      }, 4000));
    }
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, [score, onComplete]);

  if (!show) return null;

  // Animations
  const cardAnim = {
    animation: "celebrateCardIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
  };
  const emojiAnim = {
    animation: "bounceIn 0.7s cubic-bezier(0.22, 1, 0.36, 1)"
  };
  // Exceptional sparkle anims
  const sparkleAnim = {
    animation: "sparkleMove 0.8s cubic-bezier(0.4,0,0.2,1) 0s 3"
  };
  const goldPulse = {
    animation: "goldPulse 1.5s ease-in-out infinite"
  };

  return (
    <div className="fixed inset-0 z-[50] flex items-start justify-center" style={{top:0,left:0}}>
      <div className="absolute inset-0 bg-black bg-opacity-20 z-[50]" />
      <div
        className="relative z-[51] flex flex-col items-center justify-center px-10 py-8 max-w-sm w-full rounded-2xl shadow-2xl"
        style={exceptional ? { ...cardAnim, background: "linear-gradient(135deg, #FFFBEB, #FFFFFF)" } : cardAnim}
      >
        {/* Sparkles for exceptional */}
        {exceptional && (
          <>
            <span style={{...sparkleAnim, position:'absolute', top:18, left:'50%', transform:'translateX(-50%)'}}>{sparkleSVG}</span>
            <span style={{...sparkleAnim, position:'absolute', top:38, left:32}}>{sparkleSVG}</span>
            <span style={{...sparkleAnim, position:'absolute', top:38, right:32}}>{sparkleSVG}</span>
          </>
        )}
        <div className="flex flex-col items-center justify-center w-full mb-4">
          <div className="text-[90px] leading-none mb-3" style={emojiAnim}>🎉</div>
          <div
            className="font-bold text-3xl mb-2 text-center"
            style={exceptional ? { color: '#D97706', textShadow: '0 0 32px rgba(251,191,36,0.6)' } : { color: '#0F172A' }}
          >
            {exceptional ? "Exceptional Performance!" : "Great Session!"}
          </div>
        </div>
        <div className="text-sm mb-2" style={{ color: '#64748B' }}>
          {exceptional
            ? `You scored ${score}% — this is a personal best level performance.`
            : `You scored ${score}% and unlocked a new aquarium addition.`}
        </div>
        <div
          className="font-bold mb-2"
          style={exceptional ? { ...goldPulse, color: '#D97706', fontSize: 48 } : { color: '#0D9488', fontSize: 48 }}
        >
          {score}%
        </div>
        {exceptional ? (
          <>
            <div className="rounded-full border border-[#F59E0B] text-[#F59E0B] px-3 py-1 text-xs mb-1 bg-transparent">⭐ Top Performer</div>
            <div className="text-xs text-[#64748B] mb-3">Score above 90% unlocks special aquarium items</div>
            <button
              className="mt-2 w-full py-2 rounded-full bg-[#F59E0B] text-white font-semibold text-base shadow-md hover:bg-[#fbbf24] transition"
              onClick={() => { setShow(false); onComplete && onComplete(); }}
            >
              Claim Your Reward
            </button>
          </>
        ) : (
          <>
            <div className="rounded-full bg-[#0D9488] text-white px-3 py-1 text-xs mb-1">Above unlock threshold ✓</div>
            <button
              className="mt-2 w-full py-2 rounded-full border-2 border-[#0D9488] text-[#0D9488] font-semibold text-base bg-white hover:bg-[#ccfbf1] transition"
              onClick={() => { setShow(false); onComplete && onComplete(); }}
            >
              Continue
            </button>
          </>
        )}
      </div>
      <style>{`
        @keyframes celebrateCardIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.5) translateY(-40px); opacity: 0; }
          60% { transform: scale(1.2) translateY(10px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes sparkleMove {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          80% { opacity: 0.7; transform: translateY(-20px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-20px) scale(1.2); }
        }
        @keyframes goldPulse {
          0%, 100% { text-shadow: 0 0 10px rgba(251,191,36,0.3); }
          50% { text-shadow: 0 0 25px rgba(251,191,36,0.8); }
        }
      `}</style>
    </div>
  );
}
