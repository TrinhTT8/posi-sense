import React from "react";

const PracticeMode = ({ userId, onFinishSession, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <h1 className="text-3xl font-bold mb-4">Practice Mode</h1>
      <p className="mb-6">User ID: {userId}</p>
      <button
        className="px-6 py-2 bg-green-500 text-white rounded mb-2 hover:bg-green-600"
        onClick={onFinishSession}
      >
        Finish Session
      </button>
      <button
        className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        onClick={onBack}
      >
        Back to Home
      </button>
    </div>
  );
};

export default PracticeMode;
