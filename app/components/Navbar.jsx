/* eslint-disable @next/next/no-img-element */
"use client";
import Link from 'next/link'
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import PromoBanner from "./PromoBanner"

function Navbar() {
  const { data: session } = useSession();
  const { cart, increaseQty, decreaseQty } = useCart()
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 w-full flex flex-col transition-all duration-700 ease-[0.16,1,0.3,1] ${
          scrolled 
            ? "bg-[#010000]/95 backdrop-blur-3xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
            : "bg-gradient-to-b from-[#010000]/90 via-[#010000]/50 to-transparent border-b border-transparent shadow-none"
        }`}
      >
        {!scrolled && !session && (
          <div className="w-full">
            <PromoBanner />
          </div>
        )}
        <div className={`max-w-[100rem] mx-auto px-6 md:px-12 flex items-center justify-between w-full transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
          
          {/* LEFT: Menu / Links */}
          <div className="flex-1 flex items-center">
            <nav className="hidden lg:flex items-center gap-10">
              <Link
                href="/ProductAll"
                className="text-[17px] font-medium uppercase tracking-[0.05em] font-sans text-[#F8E1EB] hover:text-[#F07098] transition-colors duration-500 relative group"
              >
                The Collection
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#F07098] transition-all duration-500 group-hover:w-full"></span>
              </Link>
              <Link
                href="/skin-quiz"
                className="text-[17px] font-medium uppercase tracking-[0.05em] font-sans text-[#F8E1EB] hover:text-[#F07098] transition-colors duration-500 relative group"
              >
                Skin Quiz
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#F07098] transition-all duration-500 group-hover:w-full"></span>
              </Link>
              <Link
                href="/Contact"
                className="text-[17px] font-medium uppercase tracking-[0.05em] font-sans text-[#F8E1EB] hover:text-[#F07098] transition-colors duration-500 relative group"
              >
                Contact
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#F07098] transition-all duration-500 group-hover:w-full"></span>
              </Link>
              <Link
                href="/rewards"
                className="text-[13px] font-bold uppercase tracking-[0.1em] font-sans text-[#F07098] hover:text-[#F07098] transition-colors duration-500 relative group flex items-center gap-1 bg-[#F07098]/10 px-3 py-1 rounded-full border border-[#F07098]/20"
              >
                <span>REWARDS 🎁</span>
              </Link>
            </nav>
            {/* Hamburger for mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#F8E1EB]"
            >
               <span className="material-symbols-outlined notranslate font-light text-[26px]">menu</span>
            </button>
          </div>

          {/* CENTER: BRAND */}
          <Link className="flex-1 flex justify-center items-center gap-3 group" href="/">
            <div className="h-10 md:h-12 max-w-[70px] flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-500">
              <img src="/logo.png" alt="Richse Logo" className="h-full w-auto object-contain brightness-110"/>
            </div>
            <span className="font-display font-bold text-2xl md:text-3xl text-[#F8E1EB] tracking-[0.15em] leading-none">
              RICHSE
            </span>
          </Link>

          {/* RIGHT: Accounts & Cart */}
          <div className="flex-1 flex items-center justify-end gap-6">
            {session ? (
              <Link
                href="/account"
                className="text-[#F8E1EB] hover:text-[#F07098] transition-colors duration-500 flex items-center"
                title="My Account"
              >
                <span className="material-symbols-outlined notranslate font-light text-[26px]">person</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-[#F8E1EB] hover:text-[#F07098] transition-colors duration-500 flex items-center"
                title="Login"
              >
                <span className="material-symbols-outlined notranslate font-light text-[26px]">person</span>
              </Link>
            )}

            <div className="relative">
              {/* CART BUTTON */}
              <button
                onClick={() => setOpen(!open)}
                className="text-[#F8E1EB] hover:text-[#F07098] transition-colors duration-500 flex items-center relative"
              >
                <span className="material-symbols-outlined notranslate font-light text-[26px]">
                  shopping_bag
                </span>

                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-[#F07098] text-white text-[9px] w-4 h-4 rounded-full font-bold shadow-sm">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* CART SLIDEOUT / DROPDOWN */}
              <AnimatePresence>
                {open && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="fixed inset-0 w-screen h-screen bg-black/10 backdrop-blur-sm z-[51]"
                      onClick={() => setOpen(false)}
                    />
                    
                    <motion.div 
                      initial={{ opacity: 0, x: "100%" }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: "100%" }}
                      transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
                      className="absolute right-0 top-0 h-screen w-full sm:w-[420px] bg-[#010000] sm:bg-[#010000]/95 backdrop-blur-3xl border-l border-[#F07098]/20 shadow-[-20px_0_60px_rgba(0,0,0,0.6)] p-6 z-[52] overflow-hidden flex flex-col"
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-[#F07098]/10 blur-[60px] pointer-events-none rounded-full z-0" />
                      
                      <div className="flex justify-between items-center mb-6 mt-4 border-b border-white/10 pb-4 relative z-10">
                        <h3 className="font-display text-2xl tracking-widest text-white uppercase font-bold">Your Ritual</h3>
                        <button onClick={() => setOpen(false)} className="text-white/40 hover:text-[#F07098] transition-colors relative z-10 bg-white/5 p-2 rounded-full">
                          <span className="material-symbols-outlined notranslate font-light">close</span>
                        </button>
                      </div>

                      {cart.length === 0 ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center text-white/30 relative z-10 py-20">
                          <span className="material-symbols-outlined notranslate text-5xl mb-4 font-light opacity-30">shopping_bag</span>
                          <p className="text-[12px] uppercase tracking-[0.2em] font-medium">Your bag is empty.</p>
                        </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar relative z-10 w-full mb-6">
                          {cart.map(item => (
                            <div key={item.id} className="flex gap-4 mb-6 group bg-white/5 p-3 rounded-[20px] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300">
                              <div className="relative w-16 h-[80px] bg-black/50 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                              </div>

                              <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                  <p className="font-display font-medium text-[15px] text-white line-clamp-1 tracking-tight">{item.name}</p>
                                  <p className="text-[#F07098] text-[12px] mt-1 font-bold tracking-wide">
                                    ฿{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4 mt-2 border border-white/20 rounded-full w-max px-3 py-1 bg-black/40">
                                  <button
                                    onClick={() => decreaseQty(item.id)}
                                    className="text-white/40 hover:text-[#F07098] text-lg font-light leading-none transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs text-white w-4 text-center font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => increaseQty(item.id)}
                                    className="text-white/40 hover:text-[#F07098] text-lg font-light leading-none transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {cart.length > 0 && (
                        <div className="mt-4 pt-6 border-t border-white/10 relative z-10">
                          <div className="flex justify-between items-end mb-6">
                            <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">Subtotal</span>
                            <span className="font-display font-bold text-2xl text-[#F07098]">
                              ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <Link
                            href="/Checkout"
                            className="bg-[#F07098] text-white block text-center py-4 rounded-[16px] text-[14px] uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-[#010000] transition-all duration-300 shadow-[0_10px_30px_rgba(240,112,152,0.3)] transform hover:-translate-y-1"
                            onClick={() => setOpen(false)}
                          >
                            Checkout
                          </Link>
                        </div>
                      )}

                    </motion.div>
                  </>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-sm z-[60]"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
              className="fixed top-0 left-0 w-[85vw] max-w-[340px] h-screen bg-[#010000] border-r border-[#F07098]/30 shadow-[40px_0_100px_rgba(0,0,0,0.8)] z-[61] flex flex-col pt-24 px-10 overflow-hidden"
            >
              <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-[#F07098]/10 blur-[80px] rounded-full pointer-events-none" />

              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-[#F07098] transition-colors z-10"
              >
                <span className="material-symbols-outlined notranslate font-light text-2xl">close</span>
              </button>

              <nav className="flex flex-col gap-8 relative z-10">
                <Link
                  href="/ProductAll"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-display font-medium uppercase tracking-[0.1em] text-white hover:text-[#F07098] transition-colors border-b border-white/10 pb-4"
                >
                  The Collection
                </Link>
                <Link
                  href="/skin-quiz"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-display font-medium uppercase tracking-[0.1em] text-white hover:text-[#F07098] transition-colors border-b border-white/10 pb-4"
                >
                  Skin Quiz
                </Link>
                <Link
                  href="/Contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-display font-medium uppercase tracking-[0.1em] text-white hover:text-[#F07098] transition-colors border-b border-white/10 pb-4"
                >
                  Contact
                </Link>
                <Link
                  href="/rewards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-sans font-bold uppercase tracking-[0.1em] text-[#F07098] flex items-center gap-2 pt-2 group"
                >
                  <span className="group-hover:text-white transition-colors">REWARDS 🎁</span>
                </Link>
              </nav>

              <div className="mt-auto mb-10 flex flex-col gap-4 relative z-10">
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="text-[11px] font-bold tracking-widest uppercase text-white/50 hover:text-white transition-colors">
                  My Account
                </Link>
                <p className="text-[10px] text-white/20 tracking-[0.3em] uppercase font-bold">Richse Limited</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
