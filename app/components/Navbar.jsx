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
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-700 ease-[0.16,1,0.3,1] ${
          scrolled 
            ? "bg-white/90 backdrop-blur-xl border-b border-gray-100/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] py-3" 
            : "bg-transparent border-b border-transparent py-5"
        }`}
      >
        {!scrolled && !session && <PromoBanner />}
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* LEFT: Menu / Links */}
          <div className="flex-1 flex items-center">
            <nav className="hidden lg:flex items-center gap-10">
              <Link
                href="/ProductAll"
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#161314] hover:text-[#c3a2ab] transition-colors duration-500 relative group"
              >
                The Collection
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#c3a2ab] transition-all duration-500 group-hover:w-full"></span>
              </Link>
              <Link
                href="/skin-quiz"
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#161314] hover:text-[#c3a2ab] transition-colors duration-500 relative group"
              >
                Skin Quiz
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#c3a2ab] transition-all duration-500 group-hover:w-full"></span>
              </Link>
              <Link
                href="/Contact"
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#161314] hover:text-[#c3a2ab] transition-colors duration-500 relative group"
              >
                Contact
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#c3a2ab] transition-all duration-500 group-hover:w-full"></span>
              </Link>
              <Link
                href="/rewards"
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-600 hover:text-[#c3a2ab] transition-colors duration-500 relative group flex items-center gap-1"
              >
                <span>REWARDS 🎁</span>
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#c3a2ab] transition-all duration-500 group-hover:w-full"></span>
              </Link>
            </nav>
            {/* Hamburger for mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#161314]"
            >
               <span className="material-symbols-outlined notranslate font-light text-[26px]">menu</span>
            </button>
          </div>

          {/* CENTER: BRAND */}
          <Link className="flex-1 flex justify-center items-center gap-4 group" href="/">
            <div className="h-12 md:h-14 max-w-[80px] flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-500">
              <img src="/logo.png" alt="Richse Logo" className="h-full w-auto object-contain"/>
            </div>
            <span className="font-serif text-3xl md:text-3xl text-[#161314] tracking-wider font-light leading-none">
              RICHSE
            </span>
          </Link>

          {/* RIGHT: Accounts & Cart */}
          <div className="flex-1 flex items-center justify-end gap-5">
            {session ? (
              <Link
                href="/account"
                className="text-[#161314] hover:text-[#c3a2ab] transition-colors duration-500 flex items-center"
                title="My Account"
              >
                <span className="material-symbols-outlined notranslate font-light text-[26px]">person</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-[#161314] hover:text-[#c3a2ab] transition-colors duration-500 flex items-center"
                title="Login"
              >
                <span className="material-symbols-outlined notranslate font-light text-[26px]">person</span>
              </Link>
            )}

            <div className="relative">
              {/* CART BUTTON */}
              <button
                onClick={() => setOpen(!open)}
                className="text-[#161314] hover:text-[#c3a2ab] transition-colors duration-500 flex items-center relative"
              >
                <span className="material-symbols-outlined notranslate font-light text-[26px]">
                  shopping_bag
                </span>

                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-[#c3a2ab] text-white text-[9px] w-4 h-4 rounded-full font-medium shadow-sm">
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
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
                      className="absolute right-0 mt-4 w-[360px] bg-white border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 rounded-[2rem] z-[52]"
                    >
                      
                      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h3 className="font-serif text-xl tracking-wide text-[#161314]">Your Ritual</h3>
                        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-[#161314] transition-colors">
                          <span className="material-symbols-outlined notranslate font-light">close</span>
                        </button>
                      </div>

                      {cart.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                          <span className="material-symbols-outlined notranslate text-4xl mb-4 font-light opacity-50">shopping_bag</span>
                          <p className="text-[11px] uppercase tracking-[0.2em]">Your bag is empty.</p>
                        </div>
                      ) : (
                        <div className="max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                          {cart.map(item => (
                            <div key={item.id} className="flex gap-4 mb-6 group">
                              <div className="relative w-20 h-[100px] bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              </div>

                              <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                  <p className="font-serif text-base text-[#161314] line-clamp-1">{item.name}</p>
                                  <p className="text-[#c3a2ab] text-[13px] mt-1 tracking-wide">
                                    ฿{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4 mt-2 border border-gray-200 rounded-full w-max px-3 py-1 bg-white">
                                  <button
                                    onClick={() => decreaseQty(item.id)}
                                    className="text-gray-400 hover:text-[#161314] text-lg font-light leading-none"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs text-[#161314] w-4 text-center font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => increaseQty(item.id)}
                                    className="text-gray-400 hover:text-[#c3a2ab] text-lg font-light leading-none"
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
                        <div className="mt-4 pt-6 border-t border-gray-100">
                          <div className="flex justify-between items-end mb-6">
                            <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Subtotal</span>
                            <span className="font-serif text-2xl text-[#161314]">
                              ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <Link
                            href="/Checkout"
                            className="bg-[#161314] text-white block text-center py-4 rounded-full text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-[#c3a2ab] transition-colors duration-500"
                            onClick={() => setOpen(false)}
                          >
                            Proceed to Checkout
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
              className="fixed top-0 left-0 w-[80vw] max-w-[320px] h-screen bg-white shadow-2xl z-[61] flex flex-col pt-24 px-10"
            >
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-[#161314] transition-colors"
              >
                <span className="material-symbols-outlined notranslate font-light text-2xl">close</span>
              </button>

              <nav className="flex flex-col gap-8">
                <Link
                  href="/ProductAll"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-serif text-[#161314] hover:text-[#c3a2ab] transition-colors border-b border-gray-100 pb-4"
                >
                  The Collection
                </Link>
                <Link
                  href="/skin-quiz"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-serif text-[#161314] hover:text-[#c3a2ab] transition-colors border-b border-gray-100 pb-4"
                >
                  Skin Quiz
                </Link>
                <Link
                  href="/Contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-serif text-[#161314] hover:text-[#c3a2ab] transition-colors border-b border-gray-100 pb-4"
                >
                  Contact
                </Link>
                <Link
                  href="/rewards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-serif text-[#c3a2ab] tracking-wide flex items-center gap-2 pt-2"
                >
                  REWARDS 🎁
                </Link>
              </nav>

              <div className="mt-auto mb-10 flex flex-col gap-4">
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium tracking-widest uppercase text-gray-500 hover:text-black">
                  My Account
                </Link>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase">Richse Limited</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
