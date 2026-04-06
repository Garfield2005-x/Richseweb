"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NextLink from "next/link";
import {
  ChevronLeft,
  Sparkles,
  Droplets,
  Clock,
  ShieldCheck,
  Leaf,
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCcw,
  Zap,
  Fingerprint,
  Award
} from "lucide-react";

/* ─── Consulting Data ────────────────────────────────────────── */
const STEPS = [
  {
    id: "type",
    question: "How would you describe your skin's natural baseline?",
    sub: "This helps us understand your sebum production and moisture retention.",
    options: [
      { label: "Dry & Parchmented", desc: "Feels tight, looks dull, or shows flaking.", icon: <Droplets className="text-blue-400" />, value: "Dry" },
      { label: "Oily & Luminous", desc: "Visible shine, enlarged pores, prone to congestion.", icon: <Zap className="text-yellow-400" />, value: "Oily" },
      { label: "Combination", desc: "Oily T-zone but dry or normal on cheeks.", icon: <RefreshCcw className="text-emerald-400" />, value: "Combination" },
      { label: "Balanced", desc: "Relatively even texture with no major concerns.", icon: <CheckCircle2 className="text-gray-400" />, value: "All skins" },
    ],
  },
  {
    id: "objective",
    question: "Identify your primary skin ritual objective.",
    sub: "What is the most important result you want to achieve?",
    options: [
      { label: "Deep Hydration", desc: "Restore moisture and plumpness.", icon: <Droplets className="text-indigo-400" />, category: "Moisturizer", keywords: ["hydrate", "moisture", "water", "plump"] },
      { label: "Youthful Vitality", desc: "Target fine lines and enhance firmness.", icon: <Clock className="text-amber-500" />, category: "Serum", keywords: ["anti-aging", "firming", "wrinkle", "retinol"] },
      { label: "Pure Radiance", desc: "Brighten tone and fade dark spots.", icon: <Sparkles className="text-yellow-500" />, category: "Serum", keywords: ["brighten", "vitamin c", "glow", "tone"] },
      { label: "Clarity & Balance", desc: "Minimize pores and control excess oil.", icon: <Fingerprint className="text-emerald-500" />, category: "Mask", keywords: ["pore", "oil", "clear", "clay"] },
    ],
  },
  {
    id: "sensitivity",
    question: "Assess your skin's reactivity level.",
    sub: "Does your skin react strongly to environmental changes or products?",
    options: [
      { label: "Highly Sensitive", desc: "Easily irritated or prone to redness.", icon: <ShieldCheck className="text-rose-400" />, value: "Sensitive" },
      { label: "Balanced / Resilient", desc: "Rarely reacts, handles most actives well.", icon: <Leaf className="text-emerald-500" />, value: "Normal" },
    ],
  },
];

const ANALYSIS_PHRASES = [
  "Mapping your dermal profile...",
  "Consulting the Richse ingredient database...",
  "Curating your personalized ritual...",
  "Sequencing the perfect formula matches...",
  "Finalizing your unique skincare prescription...",
];

/* ─── Transition Variants ────────────────────────────────────── */
const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 100 : -100, scale: 0.95 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -100 : 100, scale: 1.05 }),
};

/* ─── Main Component ─────────────────────────────────────────── */
export default function SkinQuiz() {
  const [screen, setScreen] = useState("welcome");
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({});
  const [recommended, setRecommended] = useState([]);
  const [analyzePhrase, setAnalyzePhrase] = useState(0);

  useEffect(() => {
    if (screen !== "analyzing") return;
    const interval = setInterval(() => {
      setAnalyzePhrase((p) => p + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [screen]);

  useEffect(() => {
    if (screen !== "analyzing") return;

    async function fetchAndFilter() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const all = Array.isArray(data) ? data : (data.products ?? []);

        // Matching Logic
        const skinType = answers.type?.value || "All skins";
        const targetCategory = answers.objective?.category;
        const keywords = answers.objective?.keywords || [];
        const isSensitive = answers.sensitivity?.value === "Sensitive";

        const scored = all.map(p => {
          let score = 0;
          let matchReasons = [];
          
          const haystack = `${p.name} ${p.description} ${p.category}`.toLowerCase();
          const pSkinType = (p.skinType || "All skins").toLowerCase();

          if (pSkinType.includes(skinType.toLowerCase())) {
            score += 15;
            matchReasons.push(`Optimized for ${skinType} skin`);
          } else if (pSkinType === "all skins") {
            score += 8;
            matchReasons.push("Gentle for all skin types");
          }

          if (p.category === targetCategory) {
            score += 10;
          }

          let keywordMatches = 0;
          keywords.forEach(kw => {
            if (haystack.includes(kw.toLowerCase())) {
              score += 5;
              keywordMatches++;
            }
          });
          if (keywordMatches > 0) {
            matchReasons.push(`Targets ${answers.objective?.label}`);
          }

          if (isSensitive) {
            const reactiveKeywords = ["acid", "peel", "retinol", "potent", "strong", "active"];
            const containsActives = reactiveKeywords.some(kw => haystack.includes(kw));
            if (containsActives) {
              score -= 20;
            } else {
              score += 5;
              matchReasons.push("Safe for sensitive profiles");
            }
          }

          return { ...p, score, matchReasons: [...new Set(matchReasons)].slice(0, 2) };
        });

        const top = scored
          .filter(p => p.isActive !== false && p.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
          
        setRecommended(top);
      } catch (e) {
        console.error(e);
        setRecommended([]);
      }
      setTimeout(() => setScreen("results"), 4500);
    }

    fetchAndFilter();
  }, [screen, answers]);

  const handleSelect = (option) => {
    setAnswers({ ...answers, [STEPS[stepIndex].id]: option });

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
    } else {
      setDirection(-1);
      setStepIndex((i) => i - 1);
    }
  };

  const restart = () => {
    setScreen("welcome");
    setStepIndex(0);
    setAnswers({});
    setRecommended([]);
    setAnalyzePhrase(0);
  };

  return (
    <div className="min-h-screen bg-[#010000] text-white selection:bg-[#F07098] selection:text-white font-sans overflow-x-hidden relative flex flex-col items-center justify-center">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#F07098]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#F394B8]/5 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <WelcomeScreen key="welcome" onStart={() => setScreen("quiz")} />
        )}

        {screen === "quiz" && (
          <QuizInterface
            key="quiz"
            stepIndex={stepIndex}
            direction={direction}
            answers={answers}
            onSelect={handleSelect}
            onBack={handleBack}
          />
        )}

        {screen === "analyzing" && (
          <AnalyzingScreen key="analyzing" phrase={ANALYSIS_PHRASES[analyzePhrase % ANALYSIS_PHRASES.length]} />
        )}

        {screen === "results" && (
          <ResultsScreen
            key="results"
            recommended={recommended}
            answers={answers}
            onRestart={restart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Sub-Components ─────────────────────────────────────────── */

function WelcomeScreen({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="text-center space-y-12 max-w-4xl px-6 relative z-10"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#F07098]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#F07098]">Skin Intelligence</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#F07098]" />
        </motion.div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-luxury font-bold text-white uppercase tracking-tight leading-tight">
          Skin <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F07098] to-[#F8E1EB]">Diary</span>
        </h1>
        <p className="text-white/40 font-light tracking-[0.2em] text-[12px] md:text-[14px] uppercase max-w-xl mx-auto leading-relaxed">
          Unlock a bespoke skincare ritual tailored to your unique anatomical profile. Take a moment to consult with our AI skin specialist.
        </p>
      </div>

      <div className="flex flex-col items-center gap-10">
        <button
          onClick={onStart}
          className="group relative px-16 py-6 bg-[#F07098] text-white rounded-2xl font-bold text-[14px] uppercase tracking-[0.4em] hover:bg-[#F394B8] transition-all duration-500 shadow-[0_20px_50px_rgba(240,112,152,0.3)] hover:shadow-[0_25px_60px_rgba(240,112,152,0.5)] active:scale-95 flex items-center gap-4"
        >
          Begin Discovery <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </button>
        <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/30 border-t border-white/5 pt-8 w-64">Safe • Science-backed • Bespoke</p>
      </div>
    </motion.div>
  );
}

function QuizInterface({ stepIndex, direction, onSelect, onBack }) {
  const step = STEPS[stepIndex];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-5xl px-6 py-20 flex flex-col relative z-10 min-h-screen"
    >
      {/* Header / Progress */}
      <div className="mb-16 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 hover:text-[#F07098] transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <div className="flex flex-col items-end gap-3">
          <span className="text-[10px] font-bold tracking-[0.4em] text-[#F07098] uppercase">Phase 0{stepIndex + 1}</span>
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i <= stepIndex ? "w-12 bg-[#F07098] shadow-[0_0_15px_rgba(240,112,152,0.6)]" : "w-6 bg-white/10"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-16"
          >
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-tight">
                {step.question}
              </h2>
              <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed max-w-2xl">{step.sub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {step.options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => onSelect(option)}
                  className="group relative flex items-start gap-8 p-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] hover:border-[#F07098] hover:bg-white/10 transition-all duration-500 text-left overflow-hidden active:scale-[0.98] shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F07098]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="size-16 bg-black/40 border border-white/5 rounded-[22px] flex items-center justify-center text-white group-hover:bg-[#F07098] group-hover:border-[#F07098] group-hover:shadow-[0_10px_30px_rgba(240,112,152,0.4)] transition-all duration-500 shrink-0 z-10 relative">
                    {option.icon}
                  </div>
                  <div className="space-y-2 z-10 relative pr-6">
                    <h4 className="text-xl font-bold text-white tracking-tight">{option.label}</h4>
                    <p className="text-sm text-white/40 font-light leading-relaxed group-hover:text-white/70 transition-colors duration-500">{option.desc}</p>
                  </div>
                  <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                    <ArrowRight size={20} className="text-[#F07098]" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const AnalyzingScreen = ({ phrase }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-16 max-w-xl px-6 relative z-10 w-full">
    <div className="relative">
      <motion.h2
        animate={{
          opacity: [0.4, 1, 0.4],
          scale: [0.98, 1, 0.98],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-6xl md:text-8xl font-luxury font-black uppercase tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-[#F07098] to-[#010000]"
      >
        Richse
      </motion.h2>
      
      {/* Dynamic Mesh Pulse behind text */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 bg-[#F07098]/20 blur-[120px] rounded-full pointer-events-none"
      />
    </div>

    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-4"
      >
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#F07098]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#F07098]">AI Dermal Analysis</p>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#F07098]" />
      </motion.div>
      
      <div className="space-y-3">
        <h3 className="text-4xl md:text-5xl font-luxury font-bold text-white uppercase tracking-tight">
          Analyzing <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F07098] to-[#F8E1EB]">Profile</span>
        </h3>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={phrase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white/30 font-medium tracking-[0.1em] text-lg lowercase italic h-8"
          >
            {phrase}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  </div>
);

function ResultsScreen({ recommended, answers, onRestart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl px-6 py-24 space-y-20 relative z-10"
    >
      <header className="space-y-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <span className="text-[#F07098] font-bold text-[10px] uppercase tracking-[0.5em]">Analysis Complete</span>
          <div className="h-px w-24 bg-gradient-to-r from-[#F07098] to-transparent" />
        </motion.div>
        
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-luxury font-bold text-white uppercase tracking-tight leading-[1.1]">
          The Prescribed <br />
          <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F07098] to-[#F8E1EB]">Collection.</span>
        </h2>
        
        <p className="text-xl text-white/40 font-light leading-relaxed max-w-3xl">
          High-performance selections curated for your unique skin identity: <span className="text-white font-bold">{answers.type?.value}</span> texture with a primary objective of <span className="text-white font-bold">{answers.objective?.label}</span>.
        </p>
      </header>

      {recommended.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommended.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 flex flex-col hover:border-[#F07098]/40 transition-all duration-700 hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
            >
              {/* Product Visual Placeholder */}
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/5 mb-8">
                <div 
                  className="size-full bg-cover bg-center group-hover:scale-110 transition-transform duration-1000" 
                  style={{ backgroundImage: `url('${product.image || "/G11.png"}')` }} 
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 text-white">
                  {product.category}
                </div>
              </div>

              <div className="flex-1 flex flex-col space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {product.matchReasons?.map(reason => (
                      <span key={reason} className="text-[8px] font-bold uppercase tracking-widest bg-[#F07098]/10 border border-[#F07098]/30 text-[#F07098] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                         <CheckCircle2 size={10} /> {reason}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-[#F07098] transition-colors duration-500">{product.name}</h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed line-clamp-3">{product.description}</p>
                </div>

                <div className="pt-8 border-t border-white/5 mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#F07098] mb-1.5">Investment</p>
                    <p className="text-3xl font-luxury font-bold text-white">฿{product.price?.toLocaleString()}</p>
                  </div>
                  <NextLink
                    href={`/product/${product.id}`}
                    className="size-16 bg-white/5 border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-[#F07098] hover:border-[#F07098] transition-all duration-500 shadow-2xl active:scale-90 group/btn"
                  >
                    <ArrowRight size={22} className="group-hover/btn:translate-x-1 transition-transform" />
                  </NextLink>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-24 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] text-center space-y-8 shadow-2xl">
          <div className="size-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-white/20">
            <Info size={32} />
          </div>
          <div className="space-y-3">
             <h3 className="text-2xl font-bold text-white">No Precise Match</h3>
             <p className="text-lg text-white/40 font-light max-w-md mx-auto">We couldn&apos;t find an exact match for your unique skin profile in our current elite collection.</p>
          </div>
          <button onClick={onRestart} className="px-12 py-5 bg-[#F07098] hover:bg-[#F394B8] text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95">Retake Consultation</button>
        </div>
      )}

      <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex gap-12">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F07098] flex items-center gap-2">
              <ShieldCheck size={14} /> Dermatologist Trusted
            </p>
            <p className="text-xs text-white/30 font-light max-w-[180px] leading-relaxed">Clinically validated for maximum efficacy and safety.</p>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
              <Award size={14} /> Potent Formulations
            </p>
            <p className="text-xs text-white/30 font-light max-w-[180px] leading-relaxed">High-concentration botanical actives and pure extracts.</p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 hover:text-[#F07098] transition-colors group"
        >
          <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" /> RESTART CONSULTATION
        </button>
      </footer>
    </motion.div>
  );
}
