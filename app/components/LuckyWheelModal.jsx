"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Gift, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

// Web Audio API Synthesizer helpers
const playSynthTick = (freq = 800, vol = 0.08) => {
  if (typeof window === "undefined") return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    console.error("Audio synth error:", e);
  }
};

const playFanfare = () => {
  if (typeof window === "undefined") return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const chords = [
      { f: 261.63, d: 0.1 },  // C4
      { f: 329.63, d: 0.1 },  // E4
      { f: 392.00, d: 0.1 },  // G4
      { f: 523.25, d: 0.6 }   // C5
    ];
    chords.forEach((note, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      
      const startTime = audioCtx.currentTime + index * 0.09;
      const duration = note.d;
      
      osc.frequency.setValueAtTime(note.f, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (e) {
    console.error("Audio synth error:", e);
  }
};

// Canvas drawing details for circular wheel
const drawWheel = (ctx, pool, rotationAngle, width, height) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 16;
  
  ctx.clearRect(0, 0, width, height);
  
  if (pool.length === 0) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "16px sans-serif";
    ctx.fillText("ไม่มีรายชื่อสิทธิ์จับรางวัล", centerX, centerY);
    return;
  }
  
  const N = pool.length;
  const sliceAngle = (2 * Math.PI) / N;
  
  // Sleek premium colors: dark charcoal, rose, warm gold, off-white
  const colors = [
    "#1a1819", // Dark charcoal
    "#c3a2ab", // Dusty rose
    "#110f10", // Deep black
    "#dfb7c0", // Warm pink
    "#e2b74c", // Bronze-gold
    "#876a71", // Medium muted rose
  ];
  
  for (let i = 0; i < N; i++) {
    const startAngle = i * sliceAngle + rotationAngle;
    const endAngle = (i + 1) * sliceAngle + rotationAngle;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    
    const fillStyle = colors[i % colors.length];
    ctx.fillStyle = fillStyle;
    ctx.fill();
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Text drawing
    ctx.save();
    ctx.translate(centerX, centerY);
    const middleAngle = startAngle + (endAngle - startAngle) / 2;
    ctx.rotate(middleAngle);
    
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    
    const isLightColor = fillStyle === "#c3a2ab" || fillStyle === "#dfb7c0" || fillStyle === "#e2b74c";
    ctx.fillStyle = isLightColor ? "#111111" : "#ffffff";
    
    const fontSize = Math.max(9, Math.min(15, 220 / N));
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    const name = pool[i];
    const maxLen = N > 20 ? 8 : 15;
    const truncatedName = name.length > maxLen ? name.slice(0, maxLen) + ".." : name;
    
    ctx.fillText(truncatedName, radius - 18, 0);
    ctx.restore();
  }
  
  // Gold outer rim
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#e2b74c";
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Small pegs on the rim
  for (let i = 0; i < N; i++) {
    const angle = i * sliceAngle + rotationAngle;
    const pegX = centerX + radius * Math.cos(angle);
    const pegY = centerY + radius * Math.sin(angle);
    
    ctx.beginPath();
    ctx.arc(pegX, pegY, 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e2b74c";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Central cap
  ctx.beginPath();
  ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
  ctx.fillStyle = "#161314";
  ctx.fill();
  ctx.strokeStyle = "#e2b74c";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(195, 162, 171, 0.1)";
  ctx.fill();
  
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e2b74c";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("RICHSE", centerX, centerY);
};

export default function LuckyWheelModal({ isOpen, onClose, allLeads = [], filteredLeads = [] }) {
  const [winnerHistory, setWinnerHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRemoveWinner, setAutoRemoveWinner] = useState(true);
  const [deselectedNames, setDeselectedNames] = useState(new Set());
  
  // Spin animations state
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  
  // Canvas wheel state
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  
  // Horizontal Slider state
  const [translateX, setTranslateX] = useState(0);
  const [spinCards, setSpinCards] = useState([]);
  const containerRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(500);

  const cardWidth = 140;
  const gap = 8;
  const itemWidth = cardWidth + gap;

  // Refs for tracking animation frames & tick audio timings
  const lastIndexRef = useRef(-1);
  const animationFrameIdRef = useRef(null);
  const lastTickTimeRef = useRef(0);



  // Handle viewport width calculations for the slider
  useEffect(() => {
    if (isOpen && containerRef.current) {
      setViewportWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Automatically draw names from current filtered table list, fallback to all leads
  const rawCandidates = useMemo(() => {
    const targetList = filteredLeads.length > 0 ? filteredLeads : allLeads;
    return targetList
      .map(lead => lead.name)
      .filter(name => name && name.trim().length > 0);
  }, [allLeads, filteredLeads]);

  // Clear exclusions if the list changes (render-phase sync to avoid effect warnings)
  const [prevRawCandidates, setPrevRawCandidates] = useState([]);
  if (rawCandidates !== prevRawCandidates) {
    setPrevRawCandidates(rawCandidates);
    setDeselectedNames(new Set());
  }

  // Active pool after exclusions
  const activePool = useMemo(() => {
    return rawCandidates.filter(name => !deselectedNames.has(name));
  }, [rawCandidates, deselectedNames]);

  // Slices count defines mode: Wheel (<=30) vs Slider (>30)
  const isWheelMode = activePool.length <= 30;

  // Pure seeded random confetti generator to avoid impure Math.random and setState in effects
  const confettiParticles = useMemo(() => {
    if (!winner) return [];
    const colors = ["#c3a2ab", "#e2b74c", "#dfb7c0", "#ffffff", "#ff8a9a"];
    const width = typeof window !== "undefined" ? window.innerWidth : 800;
    
    // Seed calculation based on winner name
    let val = 0;
    for (let i = 0; i < winner.length; i++) {
      val = (val << 5) - val + winner.charCodeAt(i);
      val |= 0;
    }
    
    const seededRand = () => {
      val = (val * 1664525 + 1013904223) % 4294967296;
      return val / 4294967296;
    };
    
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: seededRand() * 8 + 4,
      startX: seededRand() * width,
      duration: seededRand() * 3 + 2,
      delay: seededRand() * 1.5,
      drift: (seededRand() - 0.5) * 120
    }));
  }, [winner]);

  // Idle slider states calculated on the fly to avoid effects setState
  const idleCards = useMemo(() => {
    const cards = [];
    if (activePool.length > 0) {
      for (let i = 0; i < 30; i++) {
        cards.push(activePool[i % activePool.length]);
      }
    }
    return cards;
  }, [activePool]);

  const idleTranslateX = useMemo(() => {
    return (viewportWidth / 2) - (itemWidth * 1.5) - (cardWidth / 2);
  }, [viewportWidth, itemWidth]);

  // Draw wheel in canvas when needed
  useEffect(() => {
    if (!isOpen || !isWheelMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    drawWheel(ctx, activePool, rotation, rect.width, rect.height);
  }, [isOpen, activePool, rotation, isWheelMode]);

  // Perform Spin action
  const handleSpin = () => {
    if (activePool.length < 2) {
      toast.error("กรุณามีรายชื่อขั้นต่ำ 2 รายชื่อในการสุ่มรางวัล");
      return;
    }
    
    setIsSpinning(true);
    setWinner(null);
    setShowWinnerPopup(false);
    lastIndexRef.current = -1;
    lastTickTimeRef.current = 0;

    const winIdx = Math.floor(Math.random() * activePool.length);
    const winName = activePool[winIdx];

    const duration = 40000; // Expanded to 40 seconds for dramatic build-up

    if (isWheelMode) {
      // Classic Canvas Spin logic (18 spins for higher speed)
      const N = activePool.length;
      const sliceAngle = (2 * Math.PI) / N;
      const pointerAngle = 3 * Math.PI / 2;
      const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.5);
      
      const baseTargetAngle = pointerAngle - (winIdx * sliceAngle + sliceAngle / 2 + randomOffset);
      const targetAngle = baseTargetAngle + 18 * 2 * Math.PI; // 18 spins

      let startTime = null;

      const animateWheel = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing curve: Slow deceleration
        const ease = 1 - Math.pow(1 - progress, 5.5);
        const currentAngle = ease * targetAngle;
        
        setRotation(currentAngle);
        
        const normalizedAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const currentTickIndex = Math.floor(((pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI)) / sliceAngle) % N;
        
        if (currentTickIndex !== lastIndexRef.current) {
          lastIndexRef.current = currentTickIndex;
          const now = performance.now();
          // Throttle ticks to avoid screech sound at extreme speeds
          if (soundEnabled && now - lastTickTimeRef.current > 35) {
            playSynthTick(750 - Math.min(progress * 350, 250), 0.07);
            lastTickTimeRef.current = now;
          }
        }
        
        if (progress < 1) {
          animationFrameIdRef.current = requestAnimationFrame(animateWheel);
        } else {
          setIsSpinning(false);
          if (soundEnabled) playFanfare();
          setWinner(winName);
          setShowWinnerPopup(true);
        }
      };
      
      animationFrameIdRef.current = requestAnimationFrame(animateWheel);

    } else {
      // Slider Mode (>30 names) - Slides past 75 names for hyper speed!
      const visualCards = [];
      const winnerPosition = 75; // Lands on card index 75 (up from 35) for major rolling effect
      
      for (let i = 0; i < 85; i++) {
        if (i === winnerPosition) {
          visualCards.push(winName);
        } else {
          const randomCandidate = activePool[Math.floor(Math.random() * activePool.length)];
          visualCards.push(randomCandidate);
        }
      }
      setSpinCards(visualCards);
      
      const centerViewport = viewportWidth / 2;
      const targetCenterOfWinnerCard = winnerPosition * itemWidth + (cardWidth / 2);
      const randomShift = (Math.random() - 0.5) * (cardWidth * 0.65);
      
      const targetX = centerViewport - targetCenterOfWinnerCard + randomShift;
      const startX = (viewportWidth / 2) - (itemWidth * 1.5) - (cardWidth / 2);
      
      let startTime = null;

      const animateSlider = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const ease = 1 - Math.pow(1 - progress, 5.5);
        const currentX = startX + ease * (targetX - startX);
        
        setTranslateX(currentX);
        
        const currentCardIndex = Math.floor((-currentX + viewportWidth / 2) / itemWidth);
        if (currentCardIndex !== lastIndexRef.current) {
          lastIndexRef.current = currentCardIndex;
          const now = performance.now();
          // Throttle sound clicks to prevent overlapping clicks at high velocity
          if (soundEnabled && now - lastTickTimeRef.current > 35) {
            playSynthTick(650 - Math.min(progress * 300, 220), 0.08);
            lastTickTimeRef.current = now;
          }
        }
        
        if (progress < 1) {
          animationFrameIdRef.current = requestAnimationFrame(animateSlider);
        } else {
          setIsSpinning(false);
          if (soundEnabled) playFanfare();
          setWinner(winName);
          setShowWinnerPopup(true);
        }
      };
      
      animationFrameIdRef.current = requestAnimationFrame(animateSlider);
    }
  };

  // Stop animations on unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // Post winner processing
  const handleConfirmWinner = (keepInPool = false) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    
    setWinnerHistory(prev => [{ name: winner, time: timestamp }, ...prev]);
    
    if (!keepInPool && autoRemoveWinner) {
      setDeselectedNames(prev => {
        const next = new Set(prev);
        next.add(winner);
        return next;
      });
      toast.success(`คัดรายชื่อ "${winner}" ออกจากสิทธิ์สุ่มรอบถัดไปแล้ว`);
    }
    
    setShowWinnerPopup(false);
    setWinner(null);
  };

  // Re-enable deselected entries
  const handleResetExclusions = () => {
    setDeselectedNames(new Set());
    toast.success("รีเซ็ตสิทธิ์ของรายชื่อทั้งหมดเรียบร้อย");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[100] flex items-center justify-center p-0 md:p-6 text-white font-sans animate-in fade-in duration-300">
      
      {/* Centered Visualizer Layout (No Sidebar, Max-Width 4xl) */}
      <div className="bg-gradient-to-br from-gray-900 via-[#1b1718] to-black w-full max-w-4xl h-full md:h-[90vh] md:rounded-[2.5rem] border-0 md:border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          disabled={isSpinning}
          className="absolute top-6 right-6 z-40 p-2.5 bg-black/40 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-full transition-all disabled:opacity-30"
        >
          <X size={20} />
        </button>

        {/* Main Area */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 md:p-10 relative overflow-hidden min-h-[380px] md:min-h-0">
          
          {/* Subtle decorations */}
          <div className="absolute top-8 left-8 text-rose-300/10 pointer-events-none text-2xl font-serif">✦ RICHSE LUCKY WHEEL</div>
          <div className="absolute bottom-8 right-8 text-rose-300/10 pointer-events-none text-6xl">✦</div>
          
          {/* Modal Header */}
          <div className="text-center w-full mt-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-950/40 border border-rose-500/20 text-[#c3a2ab] rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-3">
              <Gift size={12} className="animate-bounce" /> Lucky Draw Box
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight text-white flex items-center justify-center gap-3">
              สุ่มรับของรางวัล 
              <span className="text-[#c3a2ab] font-medium italic">Richse</span>
            </h2>
            <p className="text-gray-400 text-xs mt-1">
              สุ่มจับสลากรายชื่อสิทธิ์จับรางวัล ({activePool.length} รายชื่อในวงสุ่ม)
            </p>
          </div>

          {/* Visual Container */}
          <div className="flex-1 w-full flex items-center justify-center py-6 relative">
            {isWheelMode ? (
              /* Wheel Mode (<30 entries) - Expanded Canvas Size */
              <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] flex items-center justify-center">
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-[#e2b74c] filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-[-14px]" />
                </div>
                
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full cursor-pointer rounded-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
                  style={{ transform: `rotate(0deg)` }}
                />

                {/* Center cap SPIN button */}
                <button
                  onClick={handleSpin}
                  disabled={isSpinning || activePool.length < 2}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-gradient-to-br from-gray-900 via-[#1b1718] to-black border-2 border-[#e2b74c] text-[#e2b74c] hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/80 disabled:opacity-40 disabled:pointer-events-none"
                >
                  SPIN
                </button>
              </div>
            ) : (
              /* Slide Mode (>30 entries) - Expanded Viewport Width */
              <div className="w-full max-w-2xl flex flex-col items-center space-y-4">
                <div className="text-[10px] font-black text-[#e2b74c] tracking-[0.25em] uppercase bg-[#e2b74c]/10 border border-[#e2b74c]/20 px-3 py-1 rounded-full">
                  Raffle Slider Active
                </div>
                
                {/* Slider Frame */}
                <div 
                  ref={containerRef}
                  className="relative w-full h-32 overflow-hidden rounded-3xl bg-black/60 border border-white/10 shadow-inner flex items-center"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                  
                  {/* Pointers */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-rose-500 z-20 flex flex-col items-center justify-between">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-500" />
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-rose-500" />
                  </div>
                  
                  {/* Ribbon */}
                  <div 
                    className="flex items-center gap-2 py-4 px-2"
                    style={{
                      transform: `translateX(${isSpinning || winner ? translateX : idleTranslateX}px)`,
                    }}
                  >
                    {(isSpinning || winner ? spinCards : idleCards).map((name, i) => {
                      const colors = [
                        "from-gray-900 to-[#120f10] border-white/5",
                        "from-[#c3a2ab]/20 to-[#c3a2ab]/5 border-[#c3a2ab]/20",
                        "from-[#110f10] to-[#1e1b1c] border-white/5",
                        "from-[#e2b74c]/15 to-transparent border-[#e2b74c]/20",
                      ];
                      const style = colors[i % colors.length];
                      
                      return (
                        <div
                          key={i}
                          className={`flex-shrink-0 h-20 rounded-2xl border flex flex-col items-center justify-center p-2 bg-gradient-to-br shadow-lg ${style}`}
                          style={{ width: `${cardWidth}px` }}
                        >
                          <span className="font-bold text-xs truncate max-w-full text-white px-1 mt-0.5">{name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-gray-400 text-[10px] text-center max-w-xs leading-relaxed">
                  สไลด์สล็อตอย่างรวดเร็วเพื่อสุ่มจับสิทธิ์จากรายชื่อCRMทั้งหมด ({activePool.length} คน)
                </div>
              </div>
            )}
          </div>

          {/* Compact Winner History Strip */}
          {winnerHistory.length > 0 && (
            <div className="w-full max-w-2xl bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center text-xs mt-2 relative z-10">
              <span className="text-[10px] font-black text-[#e2b74c] tracking-wider uppercase block mb-1.5">ประวัติผู้ได้รับรางวัลในรอบนี้ ({winnerHistory.length})</span>
              <div className="flex flex-wrap justify-center gap-1.5 max-h-20 overflow-y-auto pr-1">
                {winnerHistory.map((w, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 font-bold text-white text-[11px]">
                    <Trophy size={10} className="text-[#e2b74c]" />
                    {w.name}
                    <span className="text-[9px] text-gray-500 font-normal">({w.time})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-4 mt-4 relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all bg-white/5 px-3 py-2 rounded-xl border border-white/5 cursor-pointer"
              >
                {soundEnabled ? <Volume2 size={13} className="text-[#c3a2ab]" /> : <VolumeX size={13} />}
                {soundEnabled ? "ปิดเสียงเอฟเฟกต์" : "เปิดเสียงเอฟเฟกต์"}
              </button>

              {/* Auto Exclude Toggle */}
              <label className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRemoveWinner}
                  onChange={(e) => setAutoRemoveWinner(e.target.checked)}
                  className="rounded border-white/20 text-[#c3a2ab] focus:ring-0 bg-transparent cursor-pointer w-3.5 h-3.5"
                />
                <span className="text-[11px] text-gray-400 font-medium select-none">คัดคนชนะออกอัตโนมัติ</span>
              </label>

              {/* Reset entries button */}
              {deselectedNames.size > 0 && (
                <button
                  onClick={handleResetExclusions}
                  className="flex items-center gap-1.5 text-xs text-[#c3a2ab] hover:text-[#dfb7c0] bg-[#c3a2ab]/5 px-3 py-2 rounded-xl border border-[#c3a2ab]/10 cursor-pointer font-bold transition-all"
                >
                  <RefreshCw size={12} /> คืนสิทธิ์ ({deselectedNames.size} คน)
                </button>
              )}
            </div>

            {/* Spin Button if Slider Mode */}
            {!isWheelMode && (
              <button
                onClick={handleSpin}
                disabled={isSpinning || activePool.length < 2}
                className="px-12 py-3.5 bg-gradient-to-r from-amber-500 via-[#e2b74c] to-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-950/20 hover:scale-102 active:scale-98 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} /> เริ่มจับรางวัล (SPIN!)
              </button>
            )}

            <div className="text-[10px] text-gray-500 italic">
              *รายชื่อถูกซิงก์จากหน้าตารางหลักของแคมเปญ
            </div>
          </div>

        </div>

      </div>

      {/* Winner Popup Banner */}
      <AnimatePresence>
        {showWinnerPopup && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in duration-300"
          >
            {/* Seeded Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
              {confettiParticles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full"
                  initial={{ 
                    x: p.startX, 
                    y: -20, 
                    rotate: 0,
                    backgroundColor: p.color 
                  }}
                  animate={{ 
                    y: (typeof window !== "undefined" ? window.innerHeight : 600) + 20, 
                    x: p.startX + p.drift,
                    rotate: 360 
                  }}
                  transition={{ 
                    duration: p.duration, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: p.delay 
                  }}
                  style={{ width: p.size, height: p.size }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 15 } }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              className="bg-gradient-to-b from-gray-900 to-[#120f10] border border-[#e2b74c]/30 rounded-[3rem] p-8 md:p-12 w-full max-w-lg text-center shadow-2xl relative z-10"
            >
              <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-6 shadow-lg shadow-amber-950/20">
                <Trophy size={42} className="text-[#e2b74c] animate-pulse" />
              </div>

              <span className="text-[10px] font-black text-[#e2b74c] uppercase tracking-[0.4em] block mb-2">CONGRATULATIONS</span>
              
              <h3 className="text-[36px] font-display font-black leading-tight text-white mb-6 uppercase tracking-tight">
                ขอแสดงความยินดี!
              </h3>
              
              {/* Winner Box */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 mb-8 shadow-inner relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-[0.02] text-white group-hover:scale-110 transition-transform">
                  <Trophy size={160} />
                </div>
                
                <span className="text-[9px] text-[#c3a2ab] font-black tracking-widest uppercase block mb-1">รายชื่อผู้ได้รับรางวัล</span>
                <p className="text-2xl md:text-3xl font-black text-white leading-relaxed truncate max-w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {winner}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => handleConfirmWinner(false)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-[#e2b74c] hover:from-amber-600 hover:to-[#dfb7c0] text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  {autoRemoveWinner ? "บันทึกและคัดรายชื่อออก (แนะนำ)" : "บันทึกและจับต่อ"}
                </button>
                
                {autoRemoveWinner && (
                  <button
                    onClick={() => handleConfirmWinner(true)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-widest rounded-2xl border border-white/5 transition-all cursor-pointer"
                  >
                    เก็บรายชื่อไว้สุ่มต่อในรอบถัดไป
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
