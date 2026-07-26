"use client";

import { useState } from "react";

export default function PreviewPage() {
  const [bgColor, setBgColor] = useState("#0a0a0a");
  const [showGrid, setShowGrid] = useState(false);
  const [scale, setScale] = useState(100);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bgColor }}>
      {/* Top toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-4 flex-wrap">
        <h1 className="text-white font-semibold text-sm tracking-wide">
          Preview - Asad Elixir Bottle
        </h1>
        <div className="flex items-center gap-3 ml-auto">
          {/* Background color */}
          <label className="text-white/60 text-xs">Fondo:</label>
          <div className="flex items-center gap-2">
            {["#0a0a0a", "#ffffff", "#1a1a2e", "#0f3460"].map((color) => (
              <button
                key={color}
                onClick={() => setBgColor(color)}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: bgColor === color ? "#d4af37" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showGrid
                ? "bg-[#d4af37] text-black"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {showGrid ? "Grid ON" : "Grid OFF"}
          </button>

          {/* Scale slider */}
          <label className="text-white/60 text-xs">Escala: {scale}%</label>
          <input
            type="range"
            min="20"
            max="200"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-24 accent-[#d4af37]"
          />
        </div>
      </div>

      {/* Main content - image on the right */}
      <div className="flex-1 flex items-center justify-end pr-8 pt-16 pb-8">
        <div
          className={`relative ${showGrid ? "bg-[length:40px_40px] bg-white/5" : ""}`}
          style={{
            backgroundImage: showGrid
              ? "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)"
              : undefined,
            transform: `scale(${scale / 100})`,
            transformOrigin: "center right",
          }}
        >
          <img
            src="/asad_elixir_bottle.png"
            alt="Asad Elixir Bottle - AI Generated"
            className="max-h-[80vh] w-auto object-contain drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 40px rgba(212,175,55,0.15))",
            }}
          />
          {/* Dimension info */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-[10px] font-mono whitespace-nowrap">
            768 × 1344px — Asad Elixir (AI Generated)
          </div>
        </div>
      </div>
    </div>
  );
}
