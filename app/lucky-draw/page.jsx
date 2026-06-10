"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Trophy, Volume2, VolumeX, Sparkles,
  RefreshCw, Copy, ChevronLeft, Users, Lock,
  ListOrdered, X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ─── localStorage keys (shared with /admin/campanet) ─────────────────
const LS_QUEUE_KEY = "luckyDraw_lockedQueue";
const LS_RIGGED_KEY = "luckyDraw_riggedMode";
const LS_WINNERS_KEY = "luckyDraw_winners";

// ─── Audio helpers ─────────────────────────────────────────────────────
const playSynthTick = (freq = 800, vol = 0.08) => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch { /* ignore */ }
};

const playFanfare = () => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [
      { f: 261.63, d: 0.1 },
      { f: 329.63, d: 0.1 },
      { f: 392.00, d: 0.1 },
      { f: 523.25, d: 0.6 },
    ].forEach((note, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const t = ctx.currentTime + i * 0.09;
      osc.frequency.setValueAtTime(note.f, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + note.d);
    });
  } catch { /* ignore */ }
};

// ─── Canvas Wheel ──────────────────────────────────────────────────────
const drawWheel = (ctx, pool, rotationAngle, width, height) => {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(cx, cy) - 16;
  ctx.clearRect(0, 0, width, height);

  if (pool.length === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ไม่มีรายชื่อสิทธิ์จับรางวัล", cx, cy);
    return;
  }

  const N = pool.length;
  const slice = (2 * Math.PI) / N;
  const colors = ["#1a1819", "#c3a2ab", "#110f10", "#dfb7c0", "#e2b74c", "#876a71"];

  for (let i = 0; i < N; i++) {
    const sa = i * slice + rotationAngle;
    const ea = sa + slice;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, sa, ea);
    ctx.closePath();
    const fill = colors[i % colors.length];
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sa + slice / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const light = ["#c3a2ab", "#dfb7c0", "#e2b74c"].includes(fill);
    ctx.fillStyle = light ? "#111" : "#fff";
    const fs = Math.max(9, Math.min(15, 220 / N));
    ctx.font = `bold ${fs}px sans-serif`;
    const name = pool[i];
    const maxL = N > 20 ? 8 : 15;
    ctx.fillText(name.length > maxL ? name.slice(0, maxL) + ".." : name, r - 18, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = "#e2b74c";
  ctx.lineWidth = 4;
  ctx.stroke();

  for (let i = 0; i < N; i++) {
    const a = i * slice + rotationAngle;
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#e2b74c";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, 2 * Math.PI);
  ctx.fillStyle = "#161314";
  ctx.fill();
  ctx.strokeStyle = "#e2b74c";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e2b74c";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("RICHSE", cx, cy);
};

// ─── Main Page ─────────────────────────────────────────────────────────
export default function LuckyDrawPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [leads, setLeads] = useState([]);

  // Game
  const [winnerHistory, setWinnerHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRemoveWinner, setAutoRemoveWinner] = useState(true);
  const [deselectedNames, setDeselectedNames] = useState(new Set());
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);

  // Lock queue (loaded from localStorage — set via /admin/campanet)
  const [lockedQueue, setLockedQueue] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const q = localStorage.getItem(LS_QUEUE_KEY);
        return q ? JSON.parse(q) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [riggedMode, setRiggedMode] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const r = localStorage.getItem(LS_RIGGED_KEY);
        return r ? JSON.parse(r) : false;
      } catch {
        return false;
      }
    }
    return false;
  });

  // Show/hide queue overlay
  const [showQueuePanel, setShowQueuePanel] = useState(false);

  // Wheel / Slider
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);
  const [spinCards, setSpinCards] = useState([]);
  const containerRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(500);

  const cardWidth = 140;
  const gap = 8;
  const itemWidth = cardWidth + gap;

  const lastIndexRef = useRef(-1);
  const animationFrameIdRef = useRef(null);
  const lastTickTimeRef = useRef(0);
  const consumedQueueRef = useRef(false);

  // ── Load and sync from localStorage ──────────────────────────────────
  const loadQueueFromStorage = () => {
    try {
      const q = localStorage.getItem(LS_QUEUE_KEY);
      const r = localStorage.getItem(LS_RIGGED_KEY);
      if (q) setLockedQueue(JSON.parse(q));
      if (r) setRiggedMode(JSON.parse(r));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadQueueFromStorage();
    const onFocusOrStorage = () => {
      loadQueueFromStorage();
    };
    window.addEventListener("focus", onFocusOrStorage);
    window.addEventListener("storage", onFocusOrStorage);
    return () => {
      window.removeEventListener("focus", onFocusOrStorage);
      window.removeEventListener("storage", onFocusOrStorage);
    };
  }, []);

  // ── Sync queue → localStorage ─────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(LS_QUEUE_KEY, JSON.stringify(lockedQueue)); }
    catch { /* ignore */ }
  }, [lockedQueue]);

  // ── Sync riggedMode → localStorage ───────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(LS_RIGGED_KEY, JSON.stringify(riggedMode)); }
    catch { /* ignore */ }
  }, [riggedMode]);

  // ── Fetch leads ───────────────────────────────────────────────────────
  useEffect(() => { fetchForms(); }, []);

  async function fetchForms() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/campanet");
      if (res.ok) {
        setLeads(await res.json());
      } else if (res.status === 401 || res.status === 403) {
        setAuthError(true);
      } else {
        toast.error("ดึงข้อมูลรายชื่อไม่สำเร็จ");
      }
    } catch { toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ"); }
    finally { setLoading(false); }
  }

  // ── Viewport ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (containerRef.current) setViewportWidth(containerRef.current.offsetWidth);
    const onResize = () => {
      if (containerRef.current) setViewportWidth(containerRef.current.offsetWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [loading]);

  // ── Candidates ────────────────────────────────────────────────────────
  const rawCandidates = useMemo(() =>
    leads.map(l => l.name).filter(n => n?.trim().length > 0),
    [leads]);

  const [prevRaw, setPrevRaw] = useState([]);
  if (rawCandidates !== prevRaw) {
    setPrevRaw(rawCandidates);
    setDeselectedNames(new Set());
  }

  const activePool = useMemo(() =>
    rawCandidates.filter(n => !deselectedNames.has(n)),
    [rawCandidates, deselectedNames]);

  const isWheelMode = activePool.length <= 30;

  // ── Confetti ──────────────────────────────────────────────────────────
  const confettiParticles = useMemo(() => {
    if (!winner) return [];
    const colors = ["#c3a2ab", "#e2b74c", "#dfb7c0", "#ffffff", "#ff8a9a"];
    const W = typeof window !== "undefined" ? window.innerWidth : 800;
    let v = 0;
    for (let i = 0; i < winner.length; i++) { v = (v << 5) - v + winner.charCodeAt(i); v |= 0; }
    const rand = () => { v = (v * 1664525 + 1013904223) % 4294967296; return v / 4294967296; };
    return Array.from({ length: 60 }, (_, i) => ({
      id: i, color: colors[i % colors.length],
      size: rand() * 10 + 4, startX: rand() * W,
      duration: rand() * 3 + 2, delay: rand() * 1.5,
      drift: (rand() - 0.5) * 140,
    }));
  }, [winner]);

  // ── Idle cards for slider ─────────────────────────────────────────────
  const idleCards = useMemo(() => {
    if (activePool.length === 0) return [];
    return Array.from({ length: 30 }, (_, i) => activePool[i % activePool.length]);
  }, [activePool]);

  const idleTranslateX = useMemo(() =>
    (viewportWidth / 2) - (itemWidth * 1.5) - (cardWidth / 2),
    [viewportWidth, itemWidth]);

  // ── Draw canvas ───────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || authError || !isWheelMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    drawWheel(ctx, activePool, rotation, rect.width, rect.height);
  }, [loading, authError, activePool, rotation, isWheelMode]);

  // ── SPIN ──────────────────────────────────────────────────────────────
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
    consumedQueueRef.current = false;

    let winName, winIdx;

    // ── Rigged: consume first queue entry ──
    if (riggedMode && lockedQueue.length > 0) {
      const next = lockedQueue[0].trim();
      const idx = activePool.findIndex(n => n.toLowerCase() === next.toLowerCase());
      if (idx !== -1) {
        winIdx = idx;
        winName = activePool[idx];
        consumedQueueRef.current = true;
      } else {
        toast.error(`ไม่พบ "${next}" ในรายชื่อ — สุ่มปกติแทน`);
        winIdx = Math.floor(Math.random() * activePool.length);
        winName = activePool[winIdx];
      }
    } else {
      winIdx = Math.floor(Math.random() * activePool.length);
      winName = activePool[winIdx];
    }

    const duration = 9500;

    const onEnd = () => {
      setIsSpinning(false);
      if (soundEnabled) playFanfare();
      setWinner(winName);
      setShowWinnerPopup(true);
      if (consumedQueueRef.current) {
        setLockedQueue(prev => prev.slice(1));
        consumedQueueRef.current = false;
      }
    };

    // ── Wheel animation ──
    if (isWheelMode) {
      const N = activePool.length;
      const slice = (2 * Math.PI) / N;
      const ptr = 3 * Math.PI / 2;
      const offset = (Math.random() - 0.5) * slice * 0.5;
      const target = ptr - (winIdx * slice + slice / 2 + offset) + 18 * 2 * Math.PI;
      let t0 = null;

      const animate = (ts) => {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / duration, 1);
        const e = 1 - Math.pow(1 - p, 5.5);
        const a = e * target;
        setRotation(a);

        const na = (a % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const ti = Math.floor(((ptr - na + 2 * Math.PI) % (2 * Math.PI)) / slice) % N;
        if (ti !== lastIndexRef.current) {
          lastIndexRef.current = ti;
          const now = performance.now();
          if (soundEnabled && now - lastTickTimeRef.current > 35) {
            playSynthTick(750 - Math.min(p * 350, 250), 0.07);
            lastTickTimeRef.current = now;
          }
        }
        if (p < 1) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
        } else {
          onEnd();
        }
      };
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // ── Slider animation ──
    } else {
      const wpos = 75;
      const cards = Array.from({ length: 85 }, (_, i) =>
        i === wpos ? winName : activePool[Math.floor(Math.random() * activePool.length)]
      );
      setSpinCards(cards);

      const target = (viewportWidth / 2) - (wpos * itemWidth + cardWidth / 2) + (Math.random() - 0.5) * cardWidth * 0.65;
      const start = (viewportWidth / 2) - (itemWidth * 1.5) - (cardWidth / 2);
      let t0 = null;

      const animate = (ts) => {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / duration, 1);
        const e = 1 - Math.pow(1 - p, 5.5);
        const x = start + e * (target - start);
        setTranslateX(x);

        const ci = Math.floor((-x + viewportWidth / 2) / itemWidth);
        if (ci !== lastIndexRef.current) {
          lastIndexRef.current = ci;
          const now = performance.now();
          if (soundEnabled && now - lastTickTimeRef.current > 35) {
            playSynthTick(650 - Math.min(p * 300, 220), 0.08);
            lastTickTimeRef.current = now;
          }
        }
        if (p < 1) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
        } else {
          onEnd();
        }
      };
      animationFrameIdRef.current = requestAnimationFrame(animate);
    }
  };

  // ── Confirm winner ────────────────────────────────────────────────────
  const handleConfirmWinner = (keepInPool = false) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setWinnerHistory(prev => [{ name: winner, time }, ...prev]);

    try {
      const existing = JSON.parse(localStorage.getItem(LS_WINNERS_KEY) || "[]");
      existing.unshift({ name: winner, time, date: new Date().toLocaleDateString("th-TH") });
      localStorage.setItem(LS_WINNERS_KEY, JSON.stringify(existing));
    } catch { /* ignore */ }

    if (!keepInPool && autoRemoveWinner) {
      setDeselectedNames(prev => { const s = new Set(prev); s.add(winner); return s; });
      toast.success(`คัดรายชื่อ "${winner}" ออกจากการสุ่มแล้ว`);
    }
    setShowWinnerPopup(false);
    setWinner(null);
  };

  const handleResetExclusions = () => {
    setDeselectedNames(new Set());
    toast.success("คืนสิทธิ์รายชื่อผู้สุ่มทั้งหมดแล้ว");
  };

  // ── Auth error ────────────────────────────────────────────────────────
  if (authError) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-white font-sans">
      <Toaster position="top-right" />
      <div className="bg-gradient-to-b from-gray-900 to-black p-10 rounded-[3rem] border border-white/10 shadow-2xl text-center max-w-md space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-black">เข้าถึงข้อมูลสำหรับแอดมินเท่านั้น</h2>
        <button onClick={() => router.push("/login")} className="w-full py-4 bg-gradient-to-r from-[#c3a2ab] to-rose-400 text-gray-950 font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer">
          เข้าสู่ระบบ (Sign In)
        </button>
      </div>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-sans">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c3a2ab] mb-4" />
      <p className="text-gray-400 text-xs tracking-widest uppercase">กำลังดึงข้อมูลรายชื่อ...</p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#161314] to-black text-white font-sans flex flex-col">
      <Toaster position="top-right" />

      {/* ── Header ── */}
      <header className="px-6 py-3 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/campanet")}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all cursor-pointer text-gray-300 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
              Lucky Draw Studio <span className="text-[#c3a2ab] italic font-medium">Richse</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Winners counter */}
          {winnerHistory.length > 0 && (
            <button
              onClick={() => setShowQueuePanel(true)}
              className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/20 rounded-xl px-3 py-1.5 text-[10px] font-black text-amber-400 hover:bg-amber-900/30 transition-all cursor-pointer"
            >
              <Trophy size={10} /> {winnerHistory.length} ผู้ชนะ
            </button>
          )}

          <button
            onClick={() => setShowQueuePanel(true)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-[#c3a2ab] hover:bg-white/10 transition-all cursor-pointer"
          >
            <Users size={13} /> {activePool.length} คน
          </button>
        </div>
      </header>

      {/* ── Main: Full-screen visualizer ── */}
      <div className="flex-1 flex flex-col items-center justify-between p-6 md:p-10 relative overflow-hidden">

        <div className="absolute top-8 left-8 text-rose-300/4 pointer-events-none text-2xl font-serif select-none">✦ RICHSE GIVEAWAY ENGINE</div>
        <div className="absolute bottom-8 right-8 text-rose-300/4 pointer-events-none text-9xl select-none">✦</div>

        {/* Title badge */}
        <div className="text-center w-full mt-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-950/40 border border-rose-500/20 text-[#c3a2ab] rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-1">
            <Gift size={12} className="animate-bounce" /> Live Draw Screen
          </div>
          <p className="text-gray-500 text-xs">ระบบสุ่มจับรางวัลสด</p>
        </div>

        {/* Visualizer */}
        <div className="flex-1 w-full flex items-center justify-center py-4 relative">
          {isWheelMode ? (
            // ── Wheel ──
            <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[580px] lg:h-[580px] flex items-center justify-center">
              {/* Pointer */}
              <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-[#e2b74c] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]" />
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-[-16px]" />
              </div>

              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-pointer rounded-full filter drop-shadow-[0_16px_40px_rgba(0,0,0,0.8)]"
              />

              {/* SPIN button */}
              <button
                onClick={handleSpin}
                disabled={isSpinning || activePool.length < 2}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full bg-gradient-to-br from-gray-900 via-[#1b1718] to-black border-2 border-[#e2b74c] text-[#e2b74c] hover:text-white font-black text-sm uppercase tracking-wider flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-black/80 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {isSpinning ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#e2b74c] border-t-transparent animate-spin" />
                ) : "SPIN"}
              </button>
            </div>

          ) : (
            // ── Slider ──
            <div className="w-full max-w-4xl flex flex-col items-center space-y-5">
              <div className="text-[10px] font-black text-[#e2b74c] tracking-[0.25em] uppercase bg-[#e2b74c]/10 border border-[#e2b74c]/20 px-3 py-1 rounded-full">
                Raffle Slider Mode — {activePool.length.toLocaleString()} ผู้เข้าร่วม
              </div>

              <div
                ref={containerRef}
                className="relative w-full h-36 overflow-hidden rounded-3xl bg-black/60 border border-white/10 shadow-2xl flex items-center"
              >
                {/* Edge fades */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

                {/* Center marker */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-rose-500/80 z-20">
                  <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-rose-500 absolute top-0 left-1/2 -translate-x-1/2" />
                  <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[10px] border-b-rose-500 absolute bottom-0 left-1/2 -translate-x-1/2" />
                </div>

                {/* Ribbon */}
                <div
                  className="flex items-center gap-2 py-4 px-2 will-change-transform"
                  style={{ transform: `translateX(${isSpinning || winner ? translateX : idleTranslateX}px)` }}
                >
                  {(isSpinning || winner ? spinCards : idleCards).map((name, i) => {
                    const styles = [
                      "from-gray-900 to-[#120f10] border-white/5",
                      "from-[#c3a2ab]/20 to-[#c3a2ab]/5 border-[#c3a2ab]/20",
                      "from-[#110f10] to-[#1e1b1c] border-white/5",
                      "from-[#e2b74c]/15 to-transparent border-[#e2b74c]/20",
                    ];
                    return (
                      <div
                        key={i}
                        className={`flex-shrink-0 h-24 rounded-2xl border flex flex-col items-center justify-center p-2 bg-gradient-to-br shadow-lg ${styles[i % styles.length]}`}
                        style={{ width: `${cardWidth}px` }}
                      >
                        <span className="text-[8px] text-gray-500 font-black tracking-widest uppercase">#{i + 1}</span>
                        <span className="font-bold text-xs truncate max-w-full text-white px-1 mt-0.5 text-center">{name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-gray-500 text-[10px] text-center">
                สล็อตสุ่มต่อเนื่องจากรายชื่อ {activePool.length.toLocaleString()} คน
              </p>
            </div>
          )}
        </div>

        {/* ── Bottom Toolbar ── */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4 mt-2 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sound */}
            <button
              onClick={() => setSoundEnabled(v => !v)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-white/5 px-3 py-2 rounded-xl border border-white/5 cursor-pointer transition-all"
            >
              {soundEnabled ? <Volume2 size={13} className="text-[#c3a2ab]" /> : <VolumeX size={13} />}
              {soundEnabled ? "ปิดเสียง" : "เปิดเสียง"}
            </button>

            {/* Auto-remove */}
            <label className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5 cursor-pointer">
              <input
                type="checkbox" checked={autoRemoveWinner}
                onChange={e => setAutoRemoveWinner(e.target.checked)}
                className="rounded border-white/20 text-[#c3a2ab] focus:ring-0 bg-transparent cursor-pointer w-3.5 h-3.5"
              />
              <span className="text-[11px] text-gray-400 font-medium select-none">คัดชื่อผู้ชนะออกอัตโนมัติ</span>
            </label>

            {/* Reset exclusions */}
            {deselectedNames.size > 0 && (
              <button
                onClick={handleResetExclusions}
                className="flex items-center gap-1.5 text-xs text-[#c3a2ab] bg-[#c3a2ab]/5 px-3 py-2 rounded-xl border border-[#c3a2ab]/10 cursor-pointer font-bold transition-all hover:text-[#dfb7c0]"
              >
                <RefreshCw size={12} /> คืนสิทธิ์ ({deselectedNames.size})
              </button>
            )}
          </div>

          {/* Spin button for slider mode */}
          {!isWheelMode && (
            <button
              onClick={handleSpin}
              disabled={isSpinning || activePool.length < 2}
              className="px-14 py-4 bg-gradient-to-r from-amber-500 via-[#e2b74c] to-amber-600 text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-amber-950/30 hover:scale-105 active:scale-98 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSpinning ? (
                <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : <><Sparkles size={16} /> เริ่มจับรางวัล (SPIN!)</>}
            </button>
          )}

          <div className="text-[10px] text-gray-600 italic">*ดึงข้อมูลตรงจาก Richse Campanet DB</div>
        </div>
      </div>

      {/* ── Queue / Winners overlay panel (slide from right) ── */}
      <AnimatePresence>
        {showQueuePanel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setShowQueuePanel(false)}
          >
            <motion.div
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="w-full max-w-sm bg-gradient-to-b from-gray-950 to-[#120f10] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/10 bg-black/40 flex items-center justify-between">
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <ListOrdered size={16} className="text-rose-400" /> สรุปการสุ่ม
                </h2>
                <button onClick={() => setShowQueuePanel(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Queue remaining */}
                {riggedMode && (
                  <div>
                    <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Lock size={10} /> คิวล็อคที่เหลือ ({lockedQueue.length} ชื่อ)
                    </h3>
                    {lockedQueue.length > 0 ? (
                      <div className="bg-rose-950/20 border border-rose-500/15 rounded-2xl p-3 space-y-2">
                        {lockedQueue.map((name, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={`text-[9px] font-black w-4 ${i === 0 ? "text-rose-400" : "text-gray-600"}`}>{i + 1}</span>
                            <span className={`text-xs flex-1 truncate ${i === 0 ? "text-rose-200 font-bold" : "text-gray-500"}`}>
                              {i === 0 && <span className="text-rose-500 mr-1">▶</span>}{name}
                            </span>
                            <button onClick={() => setLockedQueue(prev => prev.filter((_, j) => j !== i))} className="text-rose-600 hover:text-rose-400 transition-all cursor-pointer">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">คิวว่าง — รอบต่อไปสุ่มปกติ</p>
                    )}

                    {/* Rigged toggle */}
                    <button
                      onClick={() => setRiggedMode(v => !v)}
                      className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${riggedMode ? "bg-rose-600/30 border border-rose-500/30 text-rose-300 hover:bg-rose-600/50" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}
                    >
                      {riggedMode ? "🔒 ปิดโหมดล็อค" : "🔓 เปิดโหมดล็อค"}
                    </button>
                  </div>
                )}

                {!riggedMode && (
                  <button
                    onClick={() => setRiggedMode(true)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    🔓 เปิดโหมดล็อค
                  </button>
                )}

                {/* Winners history */}
                {winnerHistory.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                        <Trophy size={10} /> ผู้ชนะรอบนี้ ({winnerHistory.length})
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(winnerHistory.map(w => w.name).join("\n"));
                          toast.success("คัดลอกรายชื่อผู้ชนะแล้ว 📋");
                        }}
                        className="flex items-center gap-1 text-[9px] text-amber-500 hover:text-amber-300 font-bold cursor-pointer"
                      >
                        <Copy size={10} /> คัดลอกทั้งหมด
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {winnerHistory.map((w, i) => (
                        <div key={i} className="flex items-center gap-3 bg-amber-950/10 border border-amber-500/10 px-3 py-2 rounded-xl group">
                          <span className="text-[9px] font-black text-amber-600 w-4">{winnerHistory.length - i}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{w.name}</p>
                            <p className="text-[8px] text-gray-500">{w.time}</p>
                          </div>
                          <button
                            onClick={() => { navigator.clipboard.writeText(w.name); toast.success(`คัดลอก "${w.name}"`); }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all cursor-pointer"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick copy textarea */}
                    <textarea
                      readOnly
                      value={winnerHistory.map(w => w.name).join("\n")}
                      onClick={e => e.target.select()}
                      className="mt-3 w-full h-20 bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-mono text-gray-400 outline-none resize-none cursor-text"
                    />
                    <span className="text-[8px] text-gray-600 block text-right">*คลิกเพื่อเลือกทั้งหมด</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Winner Popup ── */}
      <AnimatePresence>
        {showWinnerPopup && winner && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          >
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {confettiParticles.map(p => (
                <motion.div
                  key={p.id} className="absolute rounded-full"
                  initial={{ x: p.startX, y: -20, rotate: 0, backgroundColor: p.color }}
                  animate={{ y: (typeof window !== "undefined" ? window.innerHeight : 700) + 20, x: p.startX + p.drift, rotate: 360 }}
                  transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
                  style={{ width: p.size, height: p.size }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 15 } }}
              exit={{ scale: 0.8, y: 60, opacity: 0 }}
              className="bg-gradient-to-b from-gray-900 to-[#120f10] border border-[#e2b74c]/30 rounded-[3rem] p-8 md:p-12 w-full max-w-lg text-center shadow-2xl relative z-10"
            >
              <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-6">
                <Trophy size={42} className="text-[#e2b74c] animate-pulse" />
              </div>
              <span className="text-[10px] font-black text-[#e2b74c] uppercase tracking-[0.4em] block mb-2">CONGRATULATIONS</span>
              <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">ขอแสดงความยินดี!</h3>

              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 mb-8 shadow-inner">
                <span className="text-[9px] text-[#c3a2ab] font-black tracking-widest uppercase block mb-1">รายชื่อผู้ได้รับรางวัล</span>
                <p className="text-2xl md:text-3xl font-black text-white leading-relaxed">{winner}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleConfirmWinner(false)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-[#e2b74c] hover:from-amber-600 hover:to-amber-500 text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-98 cursor-pointer"
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
