import { RotateCcw, Star } from "lucide-react";
import React, { useState } from "react";

export default function Flashcard({ flashcard, onToggleStar }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  return (
    <div className="relative w-full h-72" style={{ perspective: "1000px" }}>
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-gpu cursor-pointer`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
      >
        {/* Front card */}
        <div
          className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-xl border-2 border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col justify-between p-8"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* star btn */}
          <div className="flex items-start justify-between">
            <div className="bg-slate-100 text-[10px] text-slate-600 rounded px-4 py-1 uppercase">
              {flashcard?.difficulty}
            </div>
            <button
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${flashcard.isStarred ? "bg-linear-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/25 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500"}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id);
              }}
            >
              <Star
                className="w-4 h-4"
                strokeWidth={2}
                fill={flashcard.isStarred ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* content */}
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <p className="text-lg font-semibold text-center text-slate-900 leading-relaxed">
              {flashcard.question}
            </p>
          </div>

          {/* Flip Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Click to reveal answer</span>
          </div>
        </div>

        {/* Back card */}
        <div
          className="absolute inset-0 w-full h-full bg-linear-to-br from-emerald-500 to-teal-500 border-2 border-emerald-400/60 rounded-2xl shadow-xl shadow-slate-500/30 flex flex-col justify-between p-8"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Star btn */}
          <div className="flex justify-end">
            <button
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${flashcard.isStarred ? "bg-white/30 backdrop-blur-sm text-white border border-white/40" : "bg-white/20 text-white/7- backdrop-blur-sm hover:bg-white/30 hover:text-white border border-white/20"}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id);
              }}
            >
              <Star
                className="w-4 h-4"
                strokeWidth={2}
                fill={flashcard.isStarred ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* ans content */}
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <p className="text-base text-white font-medium text-center leading-relaxed">
              {flashcard.answer}
            </p>
          </div>

          {/* Flip indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-white/70 font-medium">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Click to reveal answer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
