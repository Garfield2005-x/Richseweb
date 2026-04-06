"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import LoadingRichse from "@/app/components/LoadingRichse";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/account");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      setError("An unexpected error occurred. Please try again.");
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
              Log <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F07098] to-[#F8E1EB]">In</span>
            </h2>
            <p className="text-center text-white/40 font-light tracking-[0.15em] text-[11px] uppercase">Welcome to the inner circle</p>
          </div>

          <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
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

            {error && (
              <div className="text-[#F07098] text-[14px] text-center font-bold tracking-wide bg-[#F07098]/10 py-3 rounded-xl border border-[#F07098]/30 animate-pulse">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-[14px] font-bold rounded-2xl text-white bg-[#F07098] hover:bg-[#F394B8] hover:shadow-[0_10px_40px_rgba(240,112,152,0.4)] active:scale-[0.98] focus:outline-none uppercase tracking-[0.3em] transition-all duration-500 disabled:opacity-50"
              >
                {loading ? <LoadingRichse inline message="Authenticating" /> : "Sign In"}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-[14px] text-white/40 font-light">
              New customer?{" "}
              <Link href="/register" className="font-bold text-[#F07098] hover:text-[#F8E1EB] transition-colors ml-2 underline underline-offset-8 decoration-1">
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.3em]">
              <span className="px-4 bg-[#010000]/80 backdrop-blur-sm text-white/30">Or fast portal</span>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="w-full flex items-center justify-center gap-4 py-4 px-4 border border-white/10 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all duration-500">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-[14px] uppercase tracking-[0.2em] font-bold">Google Access</span>
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
