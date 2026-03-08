
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function Practice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedQuestion = searchParams.get("question") || "Tell me about a time when you had to deal with a difficult stakeholder. How did you handle the situation?";
  const selectedCategory = searchParams.get("category") || "Behavioral";
  const [isPracticing, setIsPracticing] = useState(false);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [eyeContactStatus, setEyeContactStatus] = useState("good");
  const [paceStatus, setPaceStatus] = useState("good");
  const [expressionStatus, setExpressionStatus] = useState("good");
  const [rightPanelOpacity, setRightPanelOpacity] = useState(1);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  const question = selectedQuestion;

  // Removed redirect to login on reload if user is not present

  useEffect(() => {
    // Request camera access
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (error) {
        console.error("Error accessing camera:", error);
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

    return () => {
      // Cleanup camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleRetryCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
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
  };

  useEffect(() => {
    let interval;
    if (isPracticing) {
      interval = window.setInterval(() => {
        // Simulate status changes
        const rand = Math.random();
        if (rand > 0.7) {
          setEyeContactStatus("good");
          setPaceStatus("good");
          setExpressionStatus("good");
        } else if (rand > 0.4) {
          setEyeContactStatus("watch");
          setPaceStatus("good");
          setExpressionStatus("good");
        } else {
          setEyeContactStatus("off");
          setPaceStatus("watch");
          setExpressionStatus("good");
        }
      }, isTrainingMode ? 2000 : 4000); // Faster updates in Training Mode
    }
    return () => clearInterval(interval);
  }, [isPracticing, isTrainingMode]);

  // Handle Focus Mode right panel dimming
  useEffect(() => {
    if (isPracticing && !isTrainingMode) {
      // In Focus Mode during recording, dim the right panel
      const checkInactivity = () => {
        const timeSinceInteraction = Date.now() - lastInteractionTime;
        if (timeSinceInteraction > 500) {
          setRightPanelOpacity(0.2);
        }
      };
      
      fadeTimeoutRef.current = window.setTimeout(checkInactivity, 500);
      
      return () => {
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
      };
    } else {
      setRightPanelOpacity(1);
    }
  }, [isPracticing, isTrainingMode, lastInteractionTime]);

  const handleStopReview = () => {
    setIsPracticing(false);
    navigate("/scorecard");
  };

  const handleEndSession = () => {
    navigate("/");
  };

  const handleRightPanelInteraction = () => {
    if (isPracticing && !isTrainingMode) {
      setRightPanelOpacity(1);
      setLastInteractionTime(Date.now());
      
      // Fade back after 3 seconds
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      fadeTimeoutRef.current = window.setTimeout(() => {
        setRightPanelOpacity(0.2);
      }, 3000);
    }
  };

  // Determine border color based on status flags
  const getBorderColor = () => {
    const issueCount = [eyeContactStatus, paceStatus, expressionStatus].filter(s => s !== "good").length;
    if (issueCount === 0) return "#10B981"; // green
    if (issueCount === 1) return "#F59E0B"; // amber
    return "#EF4444"; // red
  };

  const getStatusHint = (status, type) => {
    if (status === "good") {
      return "";
    } else if (status === "watch") {
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
      className="min-h-screen flex flex-col transition-all duration-[400ms] ease-in-out relative"
      style={{
        backgroundColor: isTrainingMode ? "#F8FAFC" : "#EEF2F6"
      }}
    >
      {/* Focus Mode Overlay */}
      {isPracticing && !isTrainingMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30, 41, 59, 0.45)',
          zIndex: 100,
          pointerEvents: 'none',
        }} />
      )}
      {/* Minimal Top Bar */}
      <header className="px-12 py-6 flex items-center justify-between">
        <h1 className="text-[#0F172A] logo-font text-xl">PosiSense</h1>
        <button 
          onClick={handleEndSession}
          className="text-[#94A3B8] hover:text-[#64748B] transition-colors text-sm"
        >
          End Session
        </button>
      </header>

      {/* Main Content - Split Layout */}
      <main className="flex-1 px-12 pb-12 flex gap-8">
        {/* Left Side - Webcam Feed (65%) */}
        <div className="flex-[65] flex flex-col">
          {/* Webcam Container */}
          <div 
            className="relative flex-1 rounded-[16px] overflow-hidden bg-[#0F172A] transition-all duration-[400ms]"
            style={{
              boxShadow: `0 0 0 3px ${getBorderColor()}`,
              transition: `box-shadow ${transitionSpeed} ease`,
              filter: isTrainingMode ? "brightness(1.05)" : "brightness(0.98)"
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Camera Error Overlay */}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-sm p-8">
                <div className="max-w-md text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="text-white text-xl mb-3">Camera Access Required</h3>
                  <p className="text-[#94A3B8] mb-6 text-sm leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleRetryCamera}
                      className="bg-[#0D9488] text-white rounded-xl px-6 py-3 hover:bg-[#0F766E] transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleEndSession}
                      className="text-[#94A3B8] hover:text-white transition-colors text-sm"
                    >
                      Go Back
                    </button>
                  </div>
                  <div className="mt-6 p-4 bg-[#1E293B] rounded-lg text-left">
                    <p className="text-xs text-[#94A3B8] mb-2">💡 Quick Fix:</p>
                    <ul className="text-xs text-[#CBD5E1] space-y-1">
                      <li>• Click the camera icon in your address bar</li>
                      <li>• Select "Allow" for camera permissions</li>
                      <li>• Refresh the page and try again</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Start Practice Overlay */}
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

          {/* Bottom Strip - Minimal Indicators */}
          <div className="mt-6 flex items-center justify-center gap-12 h-[40px]">
            {/* Eye Contact Indicator */}
            <div className="flex items-center gap-2">
              <div 
                className={`w-[8px] h-[8px] rounded-full transition-all duration-500 ${
                  isPracticing && eyeContactStatus === "watch" ? "animate-pulse" : ""
                }`}
                style={{ 
                  backgroundColor: eyeContactStatus === "good" ? "#10B981" : eyeContactStatus === "watch" ? "#F59E0B" : "#EF4444",
                  boxShadow: isTrainingMode && eyeContactStatus !== "good" ? "0 0 12px rgba(245, 158, 11, 0.4)" : "none"
                }}
              />
              {!isPracticing && (
                <span className="text-xs text-[#94A3B8]">Eye Contact</span>
              )}
              {isTrainingMode && isPracticing && getStatusHint(eyeContactStatus, "eye") && (
                <span className="text-[13px] text-[#94A3B8] ml-1">{getStatusHint(eyeContactStatus, "eye")}</span>
              )}
            </div>
            
            {/* Pace Indicator */}
            <div className="flex items-center gap-2">
              <div 
                className={`w-[8px] h-[8px] rounded-full transition-all duration-500 ${
                  isPracticing && paceStatus === "watch" ? "animate-pulse" : ""
                }`}
                style={{ 
                  backgroundColor: paceStatus === "good" ? "#10B981" : paceStatus === "watch" ? "#F59E0B" : "#EF4444",
                  boxShadow: isTrainingMode && paceStatus !== "good" ? "0 0 12px rgba(245, 158, 11, 0.4)" : "none"
                }}
              />
              {!isPracticing && (
                <span className="text-xs text-[#94A3B8]">Pace</span>
              )}
              {isTrainingMode && isPracticing && getStatusHint(paceStatus, "pace") && (
                <span className="text-[13px] text-[#94A3B8] ml-1">{getStatusHint(paceStatus, "pace")}</span>
              )}
            </div>
            
            {/* Expression Indicator */}
            <div className="flex items-center gap-2">
              <div 
                className={`w-[8px] h-[8px] rounded-full transition-all duration-500 ${
                  isPracticing && expressionStatus === "watch" ? "animate-pulse" : ""
                }`}
                style={{ 
                  backgroundColor: expressionStatus === "good" ? "#10B981" : expressionStatus === "watch" ? "#F59E0B" : "#EF4444",
                  boxShadow: isTrainingMode && expressionStatus !== "good" ? "0 0 12px rgba(245, 158, 11, 0.4)" : "none"
                }}
              />
              {!isPracticing && (
                <span className="text-xs text-[#94A3B8]">Expression</span>
              )}
              {isTrainingMode && isPracticing && getStatusHint(expressionStatus, "expression") && (
                <span className="text-[13px] text-[#94A3B8] ml-1">{getStatusHint(expressionStatus, "expression")}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Question & Controls (35%) */}
        <div 
          className="flex-[35] flex flex-col transition-opacity duration-400"
          style={{ 
            opacity: isPracticing && !isTrainingMode ? rightPanelOpacity : 1 
          }}
          onClick={handleRightPanelInteraction}
        >
          {/* Question Display */}
          <div 
            className="bg-white rounded-[16px] p-8 mb-8"
            style={{ opacity: 1 }}
          >
            <p className="text-[24px] text-[#0F172A] leading-relaxed mb-4">
              {question}
            </p>
            <div className="inline-block bg-[#E0F2F1] text-[#0D9488] px-3 py-1 rounded-full text-sm">
              {selectedCategory}
            </div>
          </div>

          {/* Focus Mode / Training Mode Toggle */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setIsTrainingMode(false)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm transition-all duration-400 ${
                !isTrainingMode 
                  ? 'bg-[#0D9488] text-white shadow-[0_2px_8px_rgba(13,148,136,0.2)]' 
                  : 'bg-white text-[#64748B] border border-[#E2E8F0]'
              }`}
              title="Simulate the real interview. Feedback waits until you're done."
            >
              Focus Mode
            </button>
            <button
              onClick={() => setIsTrainingMode(true)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm transition-all duration-400 ${
                isTrainingMode 
                  ? 'bg-[#0D9488] text-white shadow-[0_2px_8px_rgba(13,148,136,0.2)]' 
                  : 'bg-white text-[#64748B] border border-[#E2E8F0]'
              }`}
              title="Active habit correction. Live signals stay visible to help you catch patterns."
            >
              Training Mode
            </button>
          </div>

          {/* Mode Description */}
          <div className="mb-6 bg-white/60 rounded-lg p-4 transition-all duration-400">
            <p className="text-xs text-[#64748B] leading-relaxed">
              {isTrainingMode 
                ? "Training Mode: Live feedback will appear during practice to help you correct habits in real-time. Border reacts faster, hints stay visible."
                : "Focus Mode: Minimal distractions. The interface will dim during practice so you can focus entirely on your answer. Feedback comes after."
              }
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stop & Review Button */}
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