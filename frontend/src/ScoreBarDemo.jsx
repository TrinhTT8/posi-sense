import React from 'react';
import CircularScoreBar from './components/analytics/CircularScoreBar';

export default function ScoreBarDemo() {
  return (
    <div className="flex gap-8 p-8">
      <CircularScoreBar score={45} />
      <CircularScoreBar score={65} />
      <CircularScoreBar score={82} />
      <CircularScoreBar score={95} />
    </div>
  );
}
