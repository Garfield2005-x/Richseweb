"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
  Fingerprint
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

          // 1. Skin Type Match (High Priority)
          if (pSkinType.includes(skinType.toLowerCase())) {
            score += 15;
            matchReasons.push(`Optimized for ${skinType} skin`);
          } else if (pSkinType === "all skins") {
            score += 8;
            matchReasons.push("Gentle for all skin types");
          }

          // 2. Category Match
          if (p.category === targetCategory) {
            score += 10;
          }

          // 3. Objective/Keyword Match
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

          // 4. Sensitivity Filter
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
    const stepObj = STEPS[stepIndex];
    setAnswers({ ...answers, [stepObj.id]: option });

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
    <div className="min-h-screen bg-white overflow-hidden relative selection:bg-[#c3a2ab] selection:text-white font-sans selection:bg-black selection:text-white">

      {/* Premium Gradient Overlays */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#c3a2ab]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#e8d5c4]/10 rounded-full blur-[80px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {screen === "welcome" && <WelcomeScreen key="welcome" onStart={() => setScreen("quiz")} />}

        {screen === "quiz" && (
          <motion.div
            key="quiz-outer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 max-w-5xl mx-auto px-6 py-20 min-h-screen flex flex-col"
          >
            {/* Header / Progress */}
            <div className="mb-12 flex items-center justify-between">
              <button onClick={handleBack} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors group">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
              </button>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase">Consultation Phase</span>
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= stepIndex ? "w-8 bg-black" : "w-4 bg-gray-100"}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={stepIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-12"
                >
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 tracking-tight leading-[1.1]">
                      {STEPS[stepIndex].question}
                    </h2>
                    <p className="text-lg text-gray-400 font-medium max-w-xl">{STEPS[stepIndex].sub}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STEPS[stepIndex].options.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => handleSelect(option)}
                        className="group flex items-start gap-6 p-8 bg-white border border-gray-100 rounded-[2rem] hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all text-left relative overflow-hidden active:scale-[0.98]"
                      >
                        <div className="p-4 bg-gray-50 rounded-2xl text-black group-hover:bg-black group-hover:text-white transition-colors shrink-0">
                          {option.icon}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-900 tracking-tight">{option.label}</h4>
                          <p className="text-xs text-gray-400 font-medium leading-relaxed">{option.desc}</p>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight size={16} className="text-gray-300" />
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="space-y-8 max-w-4xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="h-px w-8 bg-gray-200" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c3a2ab]">Ritual Recommendation</span>
          <div className="h-px w-8 bg-gray-200" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-gray-900 tracking-tighter leading-none">
          Expert Skin <br />
          <span className="italic font-normal text-[#C9A961]">Consultation.</span>
        </h1>

        <p className="text-xl text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
          Take a moment with our dermal expert to curate a personalized ritual that speaks to your unique complexion.
        </p>

        <button
          onClick={onStart}
          className="px-14 py-6 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-black/20 group flex items-center gap-4 mx-auto"
        >
          Begin Discovery <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-30">
        <p className="text-[10px] font-black tracking-widest uppercase">Safe & Science-backed</p>
        <div className="w-px h-12 bg-gradient-to-b from-black to-transparent" />
      </div>
    </motion.div>
  );
}

/* ─── Analyzing Screen ───────────────────────────────────────── */
function AnalyzingScreen({ phrase }) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative z-10 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="space-y-12 max-w-md w-full">
        <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 4.5, ease: "easeInOut" }}
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-rose-300">
            <Sparkles size={20} className="animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">AI Skin Analysis</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={phrase}
              className="text-2xl font-display font-bold text-gray-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
            >
              {phrase}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Results Screen ─────────────────────────────────────────── */
function ResultsScreen({ recommended, answers, onRestart }) {
  return (
    <motion.div
      className="min-h-screen px-6 py-24 max-w-7xl mx-auto relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <header className="mb-20 space-y-4 max-w-3xl">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c3a2ab]">Your Personalized Ritual</span>
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 tracking-tight leading-none">
          The Prescribed <br />
          <span className="italic font-normal text-[#C9A961]">Collection.</span>
        </h2>
        <p className="text-lg text-gray-400 font-medium">Bespoke selections crafted for your unique profile: <strong className="text-black">{answers.type?.value}</strong> skin with a focus on <strong className="text-black">{answers.objective?.label}</strong>.</p>
      </header>

      {recommended.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
          {recommended.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2 * i, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-gray-50/50 rounded-[3rem] p-4 border border-gray-100 flex flex-col group hover:shadow-2xl hover:shadow-black/5 transition-all duration-700"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 p-2">
                <Image
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-[2.2rem] group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white">
                  {product.category}
                </div>
              </div>

              <div className="p-8 space-y-8 flex-1 flex flex-col">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.matchReasons?.map(reason => (
                      <span key={reason} className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle2 size={10} /> {reason}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-[#c3a2ab] transition-colors">{product.name}</h3>
                  <p className="text-sm text-gray-400 font-medium line-clamp-3 leading-relaxed">{product.description}</p>
                </div>

                <div className="pt-8 border-t border-gray-900/5 mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Price</p>
                    <p className="text-2xl font-display font-bold">฿{product.price?.toLocaleString()}</p>
                  </div>
                  <Link
                    href={`/product/${product.id}`}
                    className="size-14 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-black/10 group/btn"
                  >
                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-20 bg-gray-50 rounded-[3rem] text-center space-y-6">
          <Info size={40} className="mx-auto text-gray-300" />
          <p className="text-xl text-gray-400 font-medium">We couldn&apos;t find an exact match for your unique profile.</p>
          <button onClick={onRestart} className="px-10 py-4 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest">Retake Consultation</button>
        </div>
      )}

      <footer className="flex flex-col md:flex-row items-center justify-between gap-10 border-t border-gray-100 pt-12">
        <div className="flex gap-12">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#c3a2ab]">Dermatologist Trusted</p>
            <p className="text-xs text-gray-400 font-medium">Safe for sensitive skin types.</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A961]">Potent Formulations</p>
            <p className="text-xs text-gray-400 font-medium">High-efficacy active ingredients.</p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
        >
          <RefreshCcw size={14} /> Retake Discovery
        </button>
      </footer>
    </motion.div>
  );
}
