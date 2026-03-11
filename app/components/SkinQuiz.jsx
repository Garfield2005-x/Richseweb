"use client";

import { useState } from "react";

const concerns = [
  { name: "Acne", color: "bg-skincare-pink" },
  { name: "Dry Skin", color: "bg-skincare-beige" },
  { name: "Oily Skin", color: "bg-[#E9EDC9]" },
  { name: "Sensitive", color: "bg-[#CCD5AE]" },
  { name: "Dark Spots", color: "bg-skincare-rose" },
  { name: "Large Pores", color: "bg-[#FEFAE0]" }
];

export default function SkinQuizPage() {
  const [selectedConcern, setSelectedConcern] = useState(null);

  const handleDrop = (concern) => {
    setSelectedConcern(concern);
  };

  const resetQuiz = () => {
    setSelectedConcern(null);
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen font-sans text-stone-800">

      {/* HEADER */}
      <header className="p-6 text-center">
        <h1 className="text-3xl md:text-4xl font-serif mb-2">
          Find Your Perfect Skincare Routine
        </h1>

        <p className="text-stone-500 italic text-sm">
          Drag or click the skin concern that matches your skin
        </p>
      </header>

      {/* DROP ZONE */}
      <div className="flex justify-center py-10">
        <div
          className="w-56 h-56 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-center transition"
        >
          {selectedConcern ? (
            <span className="text-lg font-serif italic text-stone-800">
              {selectedConcern} Selected
            </span>
          ) : (
            <span className="text-xs uppercase tracking-widest text-stone-400">
              Drop Here
            </span>
          )}
        </div>
      </div>

      {/* BALLS */}
      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">

        {concerns.map((c) => (
          <div
            key={c.name}
            onClick={() => handleDrop(c.name)}
            className={`flex items-center justify-center w-24 h-24 rounded-full ${c.color}
            shadow-sm cursor-pointer hover:shadow-md text-center p-2 transition`}
          >
            <span className="text-xs font-semibold uppercase">
              {c.name}
            </span>
          </div>
        ))}

      </div>

      {/* RESULT */}
      {selectedConcern && (
        <div className="max-w-lg mx-auto mt-12 px-4">

          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-xl">

            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">
                Recommended For Your Skin
              </h2>

              <button
                onClick={resetQuiz}
                className="text-xs underline text-stone-500"
              >
                Restart
              </button>
            </div>

            {/* PRODUCTS */}
            <div className="grid grid-cols-2 gap-4">

              <div className="bg-white rounded-2xl p-3 shadow-sm border flex flex-col">
                <div className="aspect-square bg-gray-100 rounded-xl mb-3" />

                <h3 className="text-sm font-medium">
                  Hydrating Serum
                </h3>

                <p className="text-xs text-gray-500 mb-3">
                  $24
                </p>

                <button className="mt-auto bg-black text-white text-xs py-2 rounded-lg">
                  Add to Cart
                </button>
              </div>

              <div className="bg-white rounded-2xl p-3 shadow-sm border flex flex-col">
                <div className="aspect-square bg-gray-100 rounded-xl mb-3" />

                <h3 className="text-sm font-medium">
                  Gentle Cream
                </h3>

                <p className="text-xs text-gray-500 mb-3">
                  $32
                </p>

                <button className="mt-auto bg-black text-white text-xs py-2 rounded-lg">
                  Add to Cart
                </button>
              </div>

            </div>

            <p className="mt-6 text-sm text-center italic text-stone-600">
              Based on &quot;{selectedConcern}&quot;, we recommend a routine focused on hydration and barrier repair.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}