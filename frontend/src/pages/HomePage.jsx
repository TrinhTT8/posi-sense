import React from 'react';

export default function HomePage({ onStartPractice, onViewAquarium }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-900 to-sky-600">
      <h1 className="text-4xl font-bold text-white mb-8">Welcome to PosiSense</h1>
      <div className="flex gap-6">
        <button
          className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-lg shadow-lg hover:bg-emerald-600 transition"
          onClick={onStartPractice}
        >
          Start Practice
        </button>
        <button
          className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-semibold text-lg shadow-lg hover:bg-cyan-600 transition"
          onClick={onViewAquarium}
        >
          View Aquarium
        </button>
      </div>
    </div>
  );
}
