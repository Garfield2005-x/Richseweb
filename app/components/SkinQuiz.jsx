"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ─── Quiz Data ─────────────────────────────────────────────── */
const STEPS = [
  {
    id: "concern",
    question: "What is your primary skin concern?",
    sub: "Select the condition you would most like to address.",
    options: [
      { label: "Acne & Blemishes", emoji: "🫧", keywords: ["acne", "blemish", "clearing", "pore"] },
      { label: "Dryness & Flaking", emoji: "💧", keywords: ["dry", "moisture", "hydrat", "barrier"] },
      { label: "Excess Oil & Shine", emoji: "✨", keywords: ["oil", "mattif", "sebum", "balance"] },
      { label: "Uneven Tone & Spots", emoji: "🌤", keywords: ["brightening", "tone", "dark", "vitamin c", "niacin"] },
      { label: "Fine Lines & Aging", emoji: "⏳", keywords: ["anti-age", "wrinkle", "retinol", "firming", "collagen"] },
      { label: "Sensitivity & Redness", emoji: "🌸", keywords: ["sensitive", "calm", "soothe", "gentle", "redness"] },
    ],
  },
  {
    id: "feel",
    question: "How does your skin feel by midday?",
    sub: "Consider its natural state without touch-ups.",
    options: [
      { label: "Tight & Dehydrated", emoji: "🏜️", keywords: ["rich", "nourish", "oil", "cream"] },
      { label: "Oily All Over", emoji: "💦", keywords: ["lightweight", "gel", "oil-free", "matte"] },
      { label: "Oily T-zone Only", emoji: "⚖️", keywords: ["balance", "light", "hydrat", "toner"] },
      { label: "Comfortable & Balanced", emoji: "🌿", keywords: ["nourish", "bright", "protect"] },
    ],
  },
  {
    id: "sensitivity",
    question: "How sensitive is your skin?",
    sub: "How often does it react to new formulations?",
    options: [
      { label: "Highly Reactive", emoji: "🔴", keywords: ["gentle", "fragrance-free", "sooth", "calm"] },
      { label: "Occasionally Sensitive", emoji: "🟡", keywords: ["gentle", "nourish"] },
      { label: "Resilient", emoji: "🟢", keywords: ["active", "retinol", "exfoliat", "vitamin c"] },
    ],
  },
];

const ANALYSIS_PHRASES = [
  "Analyzing your unique skin profile...",
  "Cross-referencing active ingredients...",
  "Formulating your personalized routine...",
  "Selecting the perfect matches...",
  "Finalizing your prescribed ritual...",
];

/* ─── Transition Variants ────────────────────────────────────── */
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

/* ─── Main Component ─────────────────────────────────────────── */
export default function SkinQuiz() {
  const [screen, setScreen] = useState("welcome"); // welcome | quiz | analyzing | results
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState([]); // array of answered option objects
  const [recommended, setRecommended] = useState([]);
  const [analyzePhrase, setAnalyzePhrase] = useState(0);

  /* Rotate analyzing phrases */
  useEffect(() => {
    if (screen !== "analyzing") return;
    const interval = setInterval(() => {
      setAnalyzePhrase((p) => p + 1);
    }, 800);
    return () => clearInterval(interval);
  }, [screen]);

  /* Fetch products when we enter the analyzing screen */
  useEffect(() => {
    if (screen !== "analyzing") return;

    async function fetchAndFilter() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const all = Array.isArray(data) ? data : (data.products ?? []);

        // Build keyword set from all answers
        const allKeywords = answers.flatMap((a) => a.keywords).map((k) => k.toLowerCase());

        // Score each product
        const scored = all.map((p) => {
          const haystack = `${p.name} ${p.description}`.toLowerCase();
          const score = allKeywords.reduce((acc, kw) => {
            return haystack.includes(kw) ? acc + 1 : acc;
          }, 0);
          return { ...p, score };
        });

        // Sort by score, take top 4
        const top = scored.sort((a, b) => b.score - a.score || a.price - b.price).slice(0, 4);
        setRecommended(top);
      } catch (e) {
        console.error(e);
        setRecommended([]);
      }

      // Show results after 4s
      setTimeout(() => setScreen("results"), 4000);
    }

    fetchAndFilter();
  }, [screen, answers]);

  const handleSelect = (option) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (stepIndex + 1 < STEPS.length) {
      setDirection(1);
      setStepIndex((i) => i + 1);
    } else {
      setScreen("analyzing");
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      setScreen("welcome");
      setAnswers([]);
    } else {
      setDirection(-1);
      setStepIndex((i) => i - 1);
      setAnswers((prev) => prev.slice(0, -1));
    }
  };

  const restart = () => {
    setScreen("welcome");
    setStepIndex(0);
    setAnswers([]);
    setRecommended([]);
    setAnalyzePhrase(0);
  };

  /* ── Screens ── */
  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-hidden relative selection:bg-[#c3a2ab]/30 font-sans text-gray-900">
      {/* Premium Ambient Background */}
      <div className="absolute top-[-15%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-b from-[#f3e5e8]/50 to-transparent rounded-full blur-[120px] pointer-events-none opacity-80 mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[70vw] h-[70vw] bg-gradient-to-t from-[#e8d5c4]/40 to-transparent rounded-full blur-[120px] pointer-events-none opacity-60 mix-blend-multiply" />
      
      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />

      <AnimatePresence mode="wait">
        {screen === "welcome" && <WelcomeScreen key="welcome" onStart={() => setScreen("quiz")} />}
        {screen === "quiz" && (
          <QuizStep
            key={`step-${stepIndex}`}
            step={STEPS[stepIndex]}
            stepIndex={stepIndex}
            total={STEPS.length}
            direction={direction}
            onSelect={handleSelect}
            onBack={handleBack}
          />
        )}
        {screen === "analyzing" && <AnalyzingScreen key="analyzing" phrase={ANALYSIS_PHRASES[analyzePhrase % ANALYSIS_PHRASES.length]} />}
        {screen === "results" && (
          <ResultsScreen key="results" recommended={recommended} answers={answers} onRestart={restart} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Welcome Screen ─────────────────────────────────────────── */
function WelcomeScreen({ onStart }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center relative z-10"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <span className="text-[#c3a2ab] text-xs uppercase tracking-[0.4em] font-medium mb-6 block">
          Personalized Ritual
        </span>
      </motion.div>

      <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-gray-900 mb-6 leading-[1.1] tracking-tight">
        Discover Your <br />
        <span className="italic text-[#c3a2ab] font-light">Perfect Routine</span>
      </h1>
      
      <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto mb-14 leading-relaxed font-light tracking-wide">
        Take our expert consultation. Answer three thoughtful questions to curate a skincare ritual tailored precisely to your unique complexion.
      </p>

      <motion.button
        onClick={onStart}
        whileHover={{ scale: 1.02, backgroundColor: "#000" }}
        whileTap={{ scale: 0.98 }}
        className="bg-[#161314] text-white px-12 py-5 rounded-full text-sm uppercase tracking-widest transition-all shadow-2xl hover:shadow-[0_20px_40px_rgba(22,19,20,0.2)]"
      >
        Begin Consultation
      </motion.button>
    </motion.div>
  );
}

/* ─── Quiz Step ──────────────────────────────────────────────── */
function QuizStep({ step, stepIndex, total, direction, onSelect, onBack }) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative z-10"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full max-w-4xl mb-16">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-400 hover:text-[#c3a2ab] text-xs uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group">
            <span className="text-lg transform group-hover:-translate-x-1 transition-transform">←</span> Back
          </button>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">0{stepIndex + 1} / 0{total}</span>
        </div>
        <div className="h-[1px] bg-gray-200 w-full overflow-hidden">
          <motion.div
            className="h-full bg-[#c3a2ab]"
            initial={{ width: `${(stepIndex / total) * 100}%` }}
            animate={{ width: `${((stepIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <div className="w-full max-w-4xl text-center mb-16">
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-6 tracking-tight leading-tight"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {step.question}
        </motion.h2>
        <motion.p 
          className="text-gray-500 text-lg md:text-xl font-light tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {step.sub}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {step.options.map((option, i) => (
           <motion.button
            key={option.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.95)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option)}
            className="group relative flex flex-col items-center justify-center text-center gap-5 p-10 rounded-2xl bg-white/60 backdrop-blur-xl border border-white hover:border-[#c3a2ab]/40 transition-all cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(195,162,171,0.12)]"
          >
            <span className="text-4xl lg:text-5xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out">{option.emoji}</span>
            <span className="text-base font-medium text-gray-800 tracking-wide">{option.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Analyzing Screen ───────────────────────────────────────── */
function AnalyzingScreen({ phrase }) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="relative mb-16 flex justify-center items-center h-32 w-32">
        {/* Minimalist spinning rim */}
        <motion.div
          className="absolute inset-0 rounded-full border-[1px] border-t-[#c3a2ab] border-r-transparent border-b-[#c3a2ab] border-l-transparent opacity-60"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-[1px] border-r-[#e8d5c4] border-l-[#e8d5c4] border-t-transparent border-b-transparent opacity-40"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <div className="w-2 h-2 rounded-full bg-[#c3a2ab] shadow-[0_0_15px_rgba(195,162,171,1)]" />
      </div>

      <div className="h-8 relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.p
            key={phrase}
            className="text-xl md:text-2xl font-light tracking-wide text-gray-800 absolute"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {phrase}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── Results Screen ─────────────────────────────────────────── */
function ResultsScreen({ recommended, answers, onRestart }) {
  const skinType = answers[0]?.label ?? "Your Profile";

  return (
    <motion.div
      className="min-h-screen px-4 py-24 max-w-6xl mx-auto relative z-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center mb-20">
        <motion.span 
          className="text-[#c3a2ab] text-xs uppercase tracking-[0.4em] font-medium mb-6 block"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
        >
          The Ritual
        </motion.span>
        
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-gray-900 mb-8 tracking-tight leading-tight">
          Your Curated Routine
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-gray-500 text-lg font-light tracking-wide">
          <span>Tailored specifically for</span>
          <span className="px-4 py-2 bg-white/80 backdrop-blur-md border border-white rounded-full text-sm font-medium text-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            {skinType}
          </span>
        </div>
      </div>

      {recommended.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {recommended.map((product, i) => (
             <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-[#c3a2ab]/30 flex flex-col group hover:shadow-[0_20px_40px_rgba(195,162,171,0.1)] transition-all duration-500"
            >
              <div className="aspect-[4/5] overflow-hidden bg-gray-50/50 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>
              <div className="p-6 flex flex-col flex-1 items-center text-center">
                <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-3 tracking-wide">{product.name}</h3>
                <p className="text-[#c3a2ab] font-light text-sm mt-auto mb-6">
                  ฿{product.price?.toLocaleString()}
                </p>
                <Link
                  href={`/product/${product.id}`}
                  className="w-full block border border-gray-200 text-gray-900 hover:bg-[#161314] hover:border-[#161314] hover:text-white text-xs uppercase tracking-widest py-3.5 rounded-full transition-all duration-300"
                >
                  Discover
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/50 backdrop-blur-sm border border-white rounded-3xl mb-20 shadow-sm">
          <p className="text-xl text-gray-500 font-light mb-8">Discover our full collection curated for ultimate skin vitality.</p>
          <Link href="/ProductAll" className="inline-block px-12 py-4 bg-[#161314] text-white rounded-full text-sm uppercase tracking-widest hover:bg-black transition-colors shadow-xl">
            View Collection
          </Link>
        </div>
      )}

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <button
          onClick={onRestart}
          className="text-xs uppercase tracking-widest text-gray-400 hover:text-[#c3a2ab] transition-colors pb-1 border-b border-transparent hover:border-[#c3a2ab]"
        >
          Retake Consultation
        </button>
      </motion.div>
    </motion.div>
  );
}