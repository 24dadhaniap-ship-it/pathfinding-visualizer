import React from 'react';

const Legend = () => {
  const legendItems = [
    { label: 'Start Node', class: 'node-start', description: 'Vibrant green circle (drag to move)' },
    { label: 'Target Node', class: 'node-end', description: 'Vibrant red circle (drag to move)' },
    { label: 'Obstacle / Wall', class: 'node-wall', description: 'Dark obsidian cells (blocks paths)' },
    { label: 'Weighted Node (Weight: 5)', class: 'node-weight', description: 'Anchor icon (takes longer to cross)' },
    { label: 'Visited Cell', class: 'node-visited', description: 'Cyan-purple transition animation' },
    { label: 'Shortest Path', class: 'node-path', description: 'Golden glowing cells' },
    { label: 'Unvisited Cell', class: '', description: 'Empty translucent background' },
  ];

  return (
    <div className="glass-panel legend-container">
      <h3 className="legend-title">Grid Legend</h3>
      <div className="legend-items">
        {legendItems.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-preview-box">
              <div className={`node ${item.class}`} style={{ width: '22px', height: '22px', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div className="legend-text">
              <span className="legend-label">{item.label}</span>
              <span className="legend-description">{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
