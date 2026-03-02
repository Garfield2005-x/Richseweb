/* eslint-disable @next/next/no-img-element */
"use client";
import Link from 'next/link'
import { signIn, signOut, useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext"
import Image from "next/image"
import { useState } from "react"

function Navbar() {
  const { data: session } = useSession();
  const { cart, increaseQty, decreaseQty } = useCart()
  const [open, setOpen] = useState(false)

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    
    <><header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#efecec] dark:border-white/10">
      
      <div className="max-w-360 mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link className="flex items-center gap-2 group" href="/  ">
           
              <div className="h-14 w-12">
 <img src="/logo.png" alt="Logo" className="h-full w-auto"/>
</div>

            <span className="font-display text-2xl font-bold tracking-tight">Richse</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            <Link
  href="/ProductAll"
  className="group relative text-sm font-medium transition-colors hover:text-primary"
>
  Shop All
  <span className="absolute left-0 -bottom-1 h-px w-full scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
</Link>

            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">Treatments</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">Our Story</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">The Journal</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden sm:flex items-center bg-[#efecec] dark:bg-white/5 rounded-full px-4 py-1.5">
            <span className="material-symbols-outlined text-sm opacity-60">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-gray-400 w-32 md:w-48" placeholder="Search rituals..." type="text" />
          </div>
          <>
      {session ? (
        <button
          onClick={() => signOut()}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">person</span>
        </button>
      )}
    </>
           <div className="relative">

      {/* ปุ่มตะกร้า */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-primary/10 rounded-full transition-colors relative"
      >
        <span className="material-symbols-outlined">
          shopping_bag
        </span>

        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#c3a2ab] text-white text-xs px-1.5 py-0.5 rounded-full">
            {cart.length}
          </span>
        )}
      </button>

      {/* กล่องตะกร้า */}
      {open && (
        <div className="absolute right-0 mt-4 w-80 bg-white shadow-2xl p-4 rounded-2xl z-50">

          {cart.length === 0 && (
            <p className="text-gray-500">Cart is empty</p>
          )}

          {cart.map(item => (
            <div key={item.id} className="flex gap-3 mb-4">
              <Image
                src={item.image}
                alt={item.name}
                width={60}
                height={60}
                className="rounded-xl"
              />

              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.price} บาท
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="px-2 bg-gray-200 rounded"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQty(item.id)}
                    className="px-2 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cart.length > 0 && (
            <>
              <div className=" pt-3 font-bold">
                Total: {total} บาท
              </div>

              <Link
                href="/Checkout"
                className="bg-[#c3a2ab] text-white block mt-3hover:opacity-90 font-bold tracking-wide transition-all shadow-lg shadow-primary/20 text-center py-2 rounded-xl"
              >
                Checkout
              </Link>
            </>
          )}
        </div>
      )}
    </div>
        </div>
      </div>
    </header>
    </>
  )
}

export default Navbar
