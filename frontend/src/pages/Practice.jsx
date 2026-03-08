import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";

// Realistic simulation engine — mimics what Presage would send
function usePresageSim(isRunning, isTrainingMode) {
  const [eyeContactStatus, setEyeContactStatus] = useState("good");
  const [paceStatus, setPaceStatus] = useState("good");
  const [expressionStatus, setExpressionStatus] = useState("good");
  const [nervousAlert, setNervousAlert] = useState(false);

  // Accumulated stats for scorecard
  const statsRef = useRef({
    eyeContactGoodTicks: 0,
    eyeContactTotalTicks: 0,
    fillerCount: 0,
    paceHistory: [], // "fast" | "slow" | "good"
    nervousSpikes: 0,
    totalTicks: 0,
  });

  useEffect(() => {
    if (!isRunning) return;

    // Reset stats on each new recording
    statsRef.current = {
      eyeContactGoodTicks: 0,
      eyeContactTotalTicks: 0,
      fillerCount: 0,
      paceHistory: [],
      nervousSpikes: 0,
      totalTicks: 0,
    };

    // Phase-based simulation: starts rough, improves mid-session, may dip near end
    // Mimics a real candidate warming up then getting tired
    let tick = 0;

    const interval = setInterval(() => {
      tick++;
      statsRef.current.totalTicks = tick;

      const phase = tick < 5 ? "opening" : tick < 15 ? "middle" : "closing";

      // Eye contact — shaky at opening, mostly good in middle, slight dip at close
      const eyeRand = Math.random();
      let newEye;
      if (phase === "opening") {
        newEye = eyeRand > 0.5 ? "good" : eyeRand > 0.25 ? "watch" : "off";
      } else if (phase === "middle") {
        newEye = eyeRand > 0.2 ? "good" : eyeRand > 0.08 ? "watch" : "off";
      } else {
        newEye = eyeRand > 0.35 ? "good" : eyeRand > 0.15 ? "watch" : "off";
      }
      setEyeContactStatus(newEye);
      statsRef.current.eyeContactTotalTicks++;
      if (newEye === "good") statsRef.current.eyeContactGoodTicks++;

      // Pace — occasionally too fast when nervous
      const paceRand = Math.random();
      let newPace;
      if (phase === "opening") {
        newPace = paceRand > 0.45 ? "good" : paceRand > 0.2 ? "watch" : "off";
      } else {
        newPace = paceRand > 0.15 ? "good" : paceRand > 0.06 ? "watch" : "off";
      }
      setPaceStatus(newPace);
      statsRef.current.paceHistory.push(newPace);

      // Expression — mostly stable, slight randomness
      const exprRand = Math.random();
      setExpressionStatus(exprRand > 0.12 ? "good" : exprRand > 0.05 ? "watch" : "off");

      // Filler words — random chance each tick (~2 per 10 ticks on average)
      if (Math.random() < 0.18) {
        statsRef.current.fillerCount++;
      }

      // Nervous spike — only in opening or closing, max 2 total
      if (statsRef.current.nervousSpikes < 2 && Math.random() < (phase !== "middle" ? 0.08 : 0.02)) {
        statsRef.current.nervousSpikes++;
        setNervousAlert(true);
        setTimeout(() => setNervousAlert(false), 3500);
      }

    }, isTrainingMode ? 2000 : 4000);

    return () => clearInterval(interval);
  }, [isRunning, isTrainingMode]);

  const getStats = () => {
    const s = statsRef.current;
    const eyePct = s.eyeContactTotalTicks > 0
      ? Math.round((s.eyeContactGoodTicks / s.eyeContactTotalTicks) * 100)
      : 78;
    const fastTicks = s.paceHistory.filter(p => p === "off").length;
    const wpmEstimate = fastTicks > 3 ? 165 : fastTicks > 1 ? 148 : 138;
    const expressionScore = parseFloat((8.0 + Math.random() * 1.5).toFixed(1));
    const overallScore = Math.round(
      eyePct * 0.35 +
      Math.max(0, 100 - s.fillerCount * 4) * 0.3 +
      (fastTicks === 0 ? 100 : fastTicks < 3 ? 75 : 50) * 0.2 +
      expressionScore * 10 * 0.15
    );

    return {
      eyeContact: eyePct,
      eyeContactTrend: eyePct >= 75 ? "up" : eyePct >= 55 ? "neutral" : "down",
      eyeContactChange: eyePct >= 75 ? "+good" : eyePct >= 55 ? "fair" : "needs work",
      fillerWords: s.fillerCount,
      fillerTrend: s.fillerCount <= 8 ? "up" : s.fillerCount <= 15 ? "neutral" : "down",
      fillerChange: s.fillerCount <= 8 ? "low" : s.fillerCount <= 15 ? "moderate" : "high",
      wpm: wpmEstimate,
      paceTrend: wpmEstimate < 155 && wpmEstimate > 120 ? "neutral" : "down",
      paceChange: wpmEstimate < 155 && wpmEstimate > 120 ? "on target" : wpmEstimate >= 155 ? "too fast" : "too slow",
      expressionScore,
      expressionTrend: expressionScore >= 8.5 ? "up" : "neutral",
      expressionChange: expressionScore >= 8.5 ? "+engaged" : "neutral",
      overallScore,
      nervousSpikes: s.nervousSpikes,
    };
  };

  return { eyeContactStatus, paceStatus, expressionStatus, nervousAlert, getStats };
}

export default function Practice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedQuestion = searchParams.get("question") || "Tell me about a time when you had to deal with a difficult stakeholder. How did you handle the situation?";
  const selectedCategory = searchParams.get("category") || "Behavioral";

  const [isPracticing, setIsPracticing] = useState(false);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [rightPanelOpacity, setRightPanelOpacity] = useState(1);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  const { eyeContactStatus, paceStatus, expressionStatus, nervousAlert, getStats } =
    usePresageSim(isPracticing, isTrainingMode);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError(null);
      } catch (error) {
        if (error.name === "NotAllowedError") {
          setCameraError("Camera access denied. Please allow camera access in your browser settings to use this feature.");
        } else if (error.name === "NotFoundError") {
          setCameraError("No camera found. Please connect a camera device to continue.");
        } else if (error.name === "NotReadableError") {
          setCameraError("Camera is already in use by another application.");
        } else {
          setCameraError("Unable to access camera. Please check your device settings.");
        }
      }
    }
    setupCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (isPracticing && !isTrainingMode) {
      const checkInactivity = () => {
        if (Date.now() - lastInteractionTime > 500) setRightPanelOpacity(0.2);
      };
      fadeTimeoutRef.current = window.setTimeout(checkInactivity, 500);
      return () => clearTimeout(fadeTimeoutRef.current);
    } else {
      setRightPanelOpacity(1);
    }
  }, [isPracticing, isTrainingMode, lastInteractionTime]);

  const handleStopReview = () => {
    const stats = getStats();
    setIsPracticing(false);
    navigate("/scorecard", {
      state: { stats, question: selectedQuestion, category: selectedCategory }
    });
  };

  const handleEndSession = () => navigate("/");

  const handleRightPanelInteraction = () => {
    if (isPracticing && !isTrainingMode) {
      setRightPanelOpacity(1);
      setLastInteractionTime(Date.now());
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = window.setTimeout(() => setRightPanelOpacity(0.2), 3000);
    }
  };

  const getBorderColor = () => {
    const issueCount = [eyeContactStatus, paceStatus, expressionStatus].filter(s => s !== "good").length;
    if (issueCount === 0) return "#10B981";
    if (issueCount === 1) return "#F59E0B";
    return "#EF4444";
  };

  const getStatusHint = (status, type) => {
    if (status === "good") return "";
    if (status === "watch") {
      if (type === "eye") return "Looking away";
      if (type === "pace") return "Slow down";
      if (type === "expression") return "Try to relax";
    } else {
      if (type === "eye") return "Low eye contact";
      if (type === "pace") return "Too fast";
      if (type === "expression") return "Flat expression";
    }
    return "";
  };

  const transitionSpeed = isTrainingMode ? "1.5s" : "4s";

  return (
    <div
      className="min-h-screen flex flex-col transition-all duration-[400ms] ease-in-out"
      style={{ backgroundColor: isTrainingMode ? "#F8FAFC" : "#EEF2F6" }}
    >
      <header className="px-12 py-6 flex items-center justify-between">
        <h1 className="text-[#0F172A] logo-font text-xl">PosiSense</h1>
        <button onClick={handleEndSession} className="text-[#94A3B8] hover:text-[#64748B] transition-colors text-sm">
          End Session
        </button>
      </header>

      <main className="flex-1 px-12 pb-12 flex gap-8">
        {/* Left — Webcam */}
        <div className="flex-[65] flex flex-col">
          <div
            className="relative flex-1 rounded-[16px] overflow-hidden bg-[#0F172A] transition-all duration-[400ms]"
            style={{
              boxShadow: `0 0 0 3px ${getBorderColor()}`,
              transition: `box-shadow ${transitionSpeed} ease`,
              filter: isTrainingMode ? "brightness(1.05)" : "brightness(0.98)"
            }}
          >
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Nervous alert overlay */}
            {nervousAlert && isPracticing && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
                Calm down — you got this!
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-sm p-8">
                <div className="max-w-md text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-xl mb-3">Camera Access Required</h3>
                  <p className="text-[#94A3B8] mb-6 text-sm leading-relaxed">{cameraError}</p>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleEndSession} className="text-[#94A3B8] hover:text-white transition-colors text-sm">Go Back</button>
                  </div>
                </div>
              </div>
            )}

            {!isPracticing && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <button
                  onClick={() => setIsPracticing(true)}
                  className="bg-[#0D9488] text-white rounded-xl px-10 py-5 text-lg hover:bg-[#0F766E] transition-colors shadow-[0_8px_32px_rgba(13,148,136,0.3)]"
                >
                  Start Recording
                </button>
              </div>
            )}
          </div>

          {/* Signal indicators */}
          <div className="mt-6 flex items-center justify-center gap-12 h-[40px]">
            {[
              { status: eyeContactStatus, type: "eye", label: "Eye Contact" },
              { status: paceStatus, type: "pace", label: "Pace" },
              { status: expressionStatus, type: "expression", label: "Expression" },
            ].map(({ status, type, label }) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className={`w-[8px] h-[8px] rounded-full transition-all duration-500 ${isPracticing && status === "watch" ? "animate-pulse" : ""}`}
                  style={{
                    backgroundColor: status === "good" ? "#10B981" : status === "watch" ? "#F59E0B" : "#EF4444",
                    boxShadow: isTrainingMode && status !== "good" ? "0 0 12px rgba(245, 158, 11, 0.4)" : "none"
                  }}
                />
                {!isPracticing && <span className="text-xs text-[#94A3B8]">{label}</span>}
                {isTrainingMode && isPracticing && getStatusHint(status, type) && (
                  <span className="text-[13px] text-[#94A3B8] ml-1">{getStatusHint(status, type)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Question & Controls */}
        <div
          className="flex-[35] flex flex-col transition-opacity duration-400"
          style={{ opacity: isPracticing && !isTrainingMode ? rightPanelOpacity : 1 }}
          onClick={handleRightPanelInteraction}
        >
          <div className="bg-white rounded-[16px] p-8 mb-8">
            <p className="text-[24px] text-[#0F172A] leading-relaxed mb-4">{selectedQuestion}</p>
            <div className="inline-block bg-[#E0F2F1] text-[#0D9488] px-3 py-1 rounded-full text-sm">
              {selectedCategory}
            </div>
          </div>

          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setIsTrainingMode(false)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm transition-all duration-400 ${!isTrainingMode ? 'bg-[#0D9488] text-white shadow-[0_2px_8px_rgba(13,148,136,0.2)]' : 'bg-white text-[#64748B] border border-[#E2E8F0]'}`}
            >
              Focus Mode
            </button>
            <button
              onClick={() => setIsTrainingMode(true)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm transition-all duration-400 ${isTrainingMode ? 'bg-[#0D9488] text-white shadow-[0_2px_8px_rgba(13,148,136,0.2)]' : 'bg-white text-[#64748B] border border-[#E2E8F0]'}`}
            >
              Training Mode
            </button>
          </div>

          <div className="mb-6 bg-white/60 rounded-lg p-4 transition-all duration-400">
            <p className="text-xs text-[#64748B] leading-relaxed">
              {isTrainingMode
                ? "Training Mode: Live feedback will appear during practice to help you correct habits in real-time. Border reacts faster, hints stay visible."
                : "Focus Mode: Minimal distractions. The interface will dim during practice so you can focus entirely on your answer. Feedback comes after."}
            </p>
          </div>

          <div className="flex-1" />

          {isPracticing && (
            <div style={{ opacity: 1 }}>
              <button
                onClick={handleStopReview}
                className="w-full bg-[#0D9488] text-white rounded-xl px-8 py-[13px] hover:bg-[#0F766E] transition-colors shadow-[0_4px_16px_rgba(13,148,136,0.2)] text-lg"
              >
                Stop & Review
              </button>
              <p className="text-xs text-[#94A3B8] text-center mt-3">
                Your answer is being analyzed in the background
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}