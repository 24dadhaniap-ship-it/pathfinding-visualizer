import React from 'react';

const Node = React.memo(({
  row,
  col,
  isStart,
  isEnd,
  isWall,
  weight,
  isVisited,
  isPath,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  gridId
}) => {
  // Determine CSS classes dynamically
  let extraClassName = '';
  if (isStart) extraClassName = 'node-start';
  else if (isEnd) extraClassName = 'node-end';
  else if (isWall) extraClassName = 'node-wall';
  else if (isPath) extraClassName = 'node-path';
  else if (isVisited) {
    extraClassName = weight > 1 ? 'node-visited-weight' : 'node-visited';
  } else if (weight > 1) {
    extraClassName = 'node-weight';
  }

  return (
    <div
      id={`node-${gridId}-${row}-${col}`}
      className={`node ${extraClassName}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown(row, col);
      }}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp(row, col)}
    />
  );
});

Node.displayName = 'Node';

export default Node;
