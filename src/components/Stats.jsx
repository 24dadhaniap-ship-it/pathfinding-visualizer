import React from 'react';

const Stats = ({ algorithmName, visitedCount, pathLength, timeMs, isRunning }) => {
  const getStatusText = () => {
    if (isRunning) return { text: 'Visualizing path...', color: '#eab308' };
    if (visitedCount > 0) {
      return pathLength > 0 
        ? { text: 'Path found! 🎉', color: '#10b981' } 
        : { text: 'No path exists! ⚠️', color: '#ef4444' };
    }
    return { text: 'Ready', color: '#6b7280' };
  };

  const status = getStatusText();

  return (
    <div className="glass-panel stats-container">
      <h3 className="stats-title">Performance Metrics</h3>
      <div className="stats-grid">
        <div className="stats-card">
          <span className="stats-label">Algorithm</span>
          <span className="stats-value text-gradient">{algorithmName || 'None'}</span>
        </div>
        <div className="stats-card">
          <span className="stats-label">Status</span>
          <span className="stats-value" style={{ color: status.color }}>{status.text}</span>
        </div>
        <div className="stats-card">
          <span className="stats-label">Cells Explored</span>
          <span className="stats-value">{visitedCount || '-'}</span>
        </div>
        <div className="stats-card">
          <span className="stats-label">Path Length</span>
          <span className="stats-value">{pathLength > 0 ? `${pathLength} steps` : '-'}</span>
        </div>
        <div className="stats-card">
          <span className="stats-label">Time Taken</span>
          <span className="stats-value">{timeMs !== null ? `${timeMs.toFixed(1)} ms` : '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
