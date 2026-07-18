import React from 'react';
import Node from './Node';

const Grid = ({
  grid,
  onNodeMouseDown,
  onNodeMouseEnter,
  onNodeMouseUp,
  gridId
}) => {
  return (
    <div className="grid-wrapper">
      <div 
        className="grid-container"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 1fr)`,
          gap: '1px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          overflow: 'hidden',
          padding: '1px',
        }}
      >
        {grid.map((rowArr, rowIndex) => 
          rowArr.map((node, colIndex) => {
            const { isStart, isEnd, isWall, weight, isVisited, isPath } = node;
            return (
              <Node
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                isStart={isStart}
                isEnd={isEnd}
                isWall={isWall}
                weight={weight}
                isVisited={isVisited}
                isPath={isPath}
                onMouseDown={onNodeMouseDown}
                onMouseEnter={onNodeMouseEnter}
                onMouseUp={onNodeMouseUp}
                gridId={gridId}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Grid;
