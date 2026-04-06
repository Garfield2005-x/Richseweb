"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import LoadingRichse from "@/app/components/LoadingRichse";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        toast.success("Account created successfully. Please sign in.");
        router.push("/login");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to create account");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010000] text-white selection:bg-[#F07098] selection:text-white flex flex-col font-sans">
      <Navbar />

      {/* Background Decorative Glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#F07098]/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#F394B8]/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-12 md:pt-40 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-10 bg-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="space-y-3">
            <h2 className="text-center text-4xl md:text-5xl font-luxury font-bold text-white uppercase tracking-tight">
              Join <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F07098] to-[#F8E1EB]">Us</span>
            </h2>
            <p className="text-center text-white/40 font-light tracking-[0.15em] text-[11px] uppercase">Elevate your skincare journey</p>
          </div>

          <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[14px] font-bold text-[#F07098] uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-2xl relative block w-full px-5 py-4 bg-white/5 border border-white/10 placeholder-white/20 text-white focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px]"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="group">
                <label className="block text-[14px] font-bold text-[#F07098] uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-2xl relative block w-full px-5 py-4 bg-white/5 border border-white/10 placeholder-white/20 text-white focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px]"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="group">
                <label className="block text-[14px] font-bold text-[#F07098] uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-2xl relative block w-full px-5 py-4 bg-white/5 border border-white/10 placeholder-white/20 text-white focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-[14px] font-bold rounded-2xl text-white bg-[#F07098] hover:bg-[#F394B8] hover:shadow-[0_10px_40px_rgba(240,112,152,0.4)] active:scale-[0.98] focus:outline-none uppercase tracking-[0.3em] transition-all duration-500 disabled:opacity-50"
              >
                {loading ? <LoadingRichse inline message="Creating Account" /> : "Create Account"}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-[14px] text-white/40 font-light">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#F07098] hover:text-[#F8E1EB] transition-colors ml-2 underline underline-offset-8 decoration-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
