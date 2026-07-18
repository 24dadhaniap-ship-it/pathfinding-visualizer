import React, { useState, useEffect, useRef, useCallback } from 'react';
import Grid from './components/Grid';
import Legend from './components/Legend';
import Stats from './components/Stats';
import { solve as solveBFS } from './algorithms/bfs';
import { solve as solveDFS } from './algorithms/dfs';
import { solve as solveDijkstra } from './algorithms/dijkstra';
import { solve as solveAStar } from './algorithms/astar';
import { generateMaze } from './algorithms/maze/recursiveDivision';
import './App.css';

const NUM_ROWS = 20;
const NUM_COLS = 40;

const START_ROW = 10;
const START_COL = 8;
const END_ROW = 10;
const END_COL = 32;

const createNode = (row, col, startRow, startCol, endRow, endCol) => {
  return {
    row,
    col,
    isStart: row === startRow && col === startCol,
    isEnd: row === endRow && col === endCol,
    isWall: false,
    weight: 1,
    isVisited: false,
    isPath: false,
  };
};

const createInitialGrid = (startRow, startCol, endRow, endCol) => {
  const grid = [];
  for (let r = 0; r < NUM_ROWS; r++) {
    const currentRow = [];
    for (let c = 0; c < NUM_COLS; c++) {
      currentRow.push(createNode(r, c, startRow, startCol, endRow, endCol));
    }
    grid.push(currentRow);
  }
  return grid;
};

function App() {
  // Grid Nodes state
  const [gridA, setGridA] = useState([]);
  const [gridB, setGridB] = useState([]);

  // Start and End nodes coordinates
  const [startNodeA, setStartNodeA] = useState({ row: START_ROW, col: START_COL });
  const [endNodeA, setEndNodeA] = useState({ row: END_ROW, col: END_COL });
  const [startNodeB, setStartNodeB] = useState({ row: START_ROW, col: START_COL });
  const [endNodeB, setEndNodeB] = useState({ row: END_ROW, col: END_COL });

  // Control options
  const [algoA, setAlgoA] = useState('BFS');
  const [algoB, setAlgoB] = useState('Dijkstra');
  const [speed, setSpeed] = useState('fast');
  const [toolMode, setToolMode] = useState('wall'); // 'wall' | 'weight'
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Stats trackers
  const [statsA, setStatsA] = useState({ visitedCount: 0, pathLength: 0, timeMs: null });
  const [statsB, setStatsB] = useState({ visitedCount: 0, pathLength: 0, timeMs: null });

  // Mouse drag & paint tracking
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null); // 'start' | 'end' | 'wall' | 'weight' | null

  // Keep track of active timeouts for cleanup
  const timeoutsRef = useRef([]);

  // Initialize grids on mount
  useEffect(() => {
    setGridA(createInitialGrid(START_ROW, START_COL, END_ROW, END_COL));
    setGridB(createInitialGrid(START_ROW, START_COL, END_ROW, END_COL));
  }, []);

  // Window mouseup listener to end painting/dragging outside the grid
  const handleMouseUpGlobal = useCallback(() => {
    setIsMousePressed(false);
    setDraggedNode(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [handleMouseUpGlobal]);

  // Clean visual traces (visited and path node colors)
  const clearVisuals = useCallback(() => {
    // Cancel all active timeouts immediately
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const resetGridVis = (g) => {
      return g.map(row => row.map(node => ({
        ...node,
        isVisited: false,
        isPath: false
      })));
    };

    setGridA(prev => resetGridVis(prev));
    setGridB(prev => resetGridVis(prev));

    setStatsA({ visitedCount: 0, pathLength: 0, timeMs: null });
    setStatsB({ visitedCount: 0, pathLength: 0, timeMs: null });

    // Clean DOM elements directly for immediate response
    for (let r = 0; r < NUM_ROWS; r++) {
      for (let c = 0; c < NUM_COLS; c++) {
        const cellA = document.getElementById(`node-A-${r}-${c}`);
        if (cellA) {
          cellA.classList.remove('node-visited', 'node-visited-weight', 'node-path');
        }
        const cellB = document.getElementById(`node-B-${r}-${c}`);
        if (cellB) {
          cellB.classList.remove('node-visited', 'node-visited-weight', 'node-path');
        }
      }
    }
  }, [gridA, gridB]);

  // Clear everything including walls and weights
  const clearGrid = useCallback(() => {
    // Clear animations first
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Reset grids
    setGridA(createInitialGrid(startNodeA.row, startNodeA.col, endNodeA.row, endNodeA.col));
    setGridB(createInitialGrid(startNodeB.row, startNodeB.col, endNodeB.row, endNodeB.col));

    // Reset stats
    setStatsA({ visitedCount: 0, pathLength: 0, timeMs: null });
    setStatsB({ visitedCount: 0, pathLength: 0, timeMs: null });

    // Clean DOM classes selectively (avoid stripping node-start and node-end)
    for (let r = 0; r < NUM_ROWS; r++) {
      for (let c = 0; c < NUM_COLS; c++) {
        const cellA = document.getElementById(`node-A-${r}-${c}`);
        if (cellA) {
          cellA.classList.remove('node-wall', 'node-visited', 'node-visited-weight', 'node-path', 'node-weight');
        }
        const cellB = document.getElementById(`node-B-${r}-${c}`);
        if (cellB) {
          cellB.classList.remove('node-wall', 'node-visited', 'node-visited-weight', 'node-path', 'node-weight');
        }
      }
    }
  }, [startNodeA, endNodeA, startNodeB, endNodeB]);

  // Sync edits between grids
  const updateGridsStateSync = (updateFn) => {
    setGridA(prev => updateFn(prev));
    setGridB(prev => updateFn(prev));
  };

  const handleMouseDown = useCallback((row, col) => {
    if (isRunning) return;
    
    // Clear path before drawing/dragging if grid has been solved
    if (statsA.visitedCount > 0 || statsB.visitedCount > 0) {
      clearVisuals();
    }

    setIsMousePressed(true);
    const node = gridA[row][col];

    if (node.isStart) {
      setDraggedNode('start');
    } else if (node.isEnd) {
      setDraggedNode('end');
    } else if (toolMode === 'weight') {
      setDraggedNode('weight');
      // Toggle weight
      updateGridsStateSync((g) => g.map(r => r.map(n => {
        if (n.row === row && n.col === col) {
          return { ...n, weight: n.weight === 5 ? 1 : 5, isWall: false };
        }
        return n;
      })));
    } else {
      setDraggedNode('wall');
      // Toggle wall
      updateGridsStateSync((g) => g.map(r => r.map(n => {
        if (n.row === row && n.col === col) {
          return { ...n, isWall: !n.isWall, weight: 1 };
        }
        return n;
      })));
    }
  }, [isRunning, gridA, toolMode, statsA, statsB, clearVisuals]);

  const handleMouseEnter = useCallback((row, col) => {
    if (!isMousePressed || isRunning) return;

    const node = gridA[row][col];
    if (draggedNode === 'start') {
      if (node.isEnd || node.isWall) return;
      
      setStartNodeA({ row, col });
      setStartNodeB({ row, col });
      updateGridsStateSync((g) => g.map(r => r.map(n => {
        if (n.isStart) return { ...n, isStart: false };
        if (n.row === row && n.col === col) return { ...n, isStart: true, isWall: false, weight: 1 };
        return n;
      })));
    } else if (draggedNode === 'end') {
      if (node.isStart || node.isWall) return;
      
      setEndNodeA({ row, col });
      setEndNodeB({ row, col });
      updateGridsStateSync((g) => g.map(r => r.map(n => {
        if (n.isEnd) return { ...n, isEnd: false };
        if (n.row === row && n.col === col) return { ...n, isEnd: true, isWall: false, weight: 1 };
        return n;
      })));
    } else if (draggedNode === 'wall') {
      if (node.isStart || node.isEnd) return;
      
      updateGridsStateSync((g) => g.map(r => r.map(n => {
        if (n.row === row && n.col === col) return { ...n, isWall: true, weight: 1 };
        return n;
      })));
    } else if (draggedNode === 'weight') {
      if (node.isStart || node.isEnd || node.isWall) return;
      
      updateGridsStateSync((g) => g.map(r => r.map(n => {
        if (n.row === row && n.col === col) return { ...n, weight: 5 };
        return n;
      })));
    }
  }, [isMousePressed, draggedNode, isRunning, gridA]);

  const handleMouseUp = useCallback(() => {
    setIsMousePressed(false);
    setDraggedNode(null);
  }, []);

  const handleCoordinateChange = (nodeType, coordinateType, value) => {
    if (isNaN(value)) return;
    
    // Clamp values inside grid bounds
    let clampedValue = value;
    if (coordinateType === 'row') {
      clampedValue = Math.max(0, Math.min(NUM_ROWS - 1, value));
    } else {
      clampedValue = Math.max(0, Math.min(NUM_COLS - 1, value));
    }

    if (nodeType === 'start') {
      const newRow = coordinateType === 'row' ? clampedValue : startNodeA.row;
      const newCol = coordinateType === 'col' ? clampedValue : startNodeA.col;

      if (newRow === endNodeA.row && newCol === endNodeA.col) return;

      clearVisuals();

      setStartNodeA({ row: newRow, col: newCol });
      setStartNodeB({ row: newRow, col: newCol });

      updateGridsStateSync((g) => {
        return g.map(r => r.map(n => {
          if (n.isStart) return { ...n, isStart: false };
          if (n.row === newRow && n.col === newCol) {
            return { ...n, isStart: true, isWall: false, weight: 1 };
          }
          return n;
        }));
      });
    } else {
      const newRow = coordinateType === 'row' ? clampedValue : endNodeA.row;
      const newCol = coordinateType === 'col' ? clampedValue : endNodeA.col;

      if (newRow === startNodeA.row && newCol === startNodeA.col) return;

      clearVisuals();

      setEndNodeA({ row: newRow, col: newCol });
      setEndNodeB({ row: newRow, col: newCol });

      updateGridsStateSync((g) => {
        return g.map(r => r.map(n => {
          if (n.isEnd) return { ...n, isEnd: false };
          if (n.row === newRow && n.col === newCol) {
            return { ...n, isEnd: true, isWall: false, weight: 1 };
          }
          return n;
        }));
      });
    }
  };

  // Generate Maze with Recursive Division
  const handleGenerateMaze = () => {
    if (isRunning) return;
    clearGrid();
    setIsRunning(true);

    const walls = generateMaze(NUM_ROWS, NUM_COLS, startNodeA, endNodeA);
    const wallSet = new Set(walls.map(w => `${w.row},${w.col}`));

    // Animate the maze generation
    walls.forEach((wall, idx) => {
      const timeoutId = setTimeout(() => {
        const cellA = document.getElementById(`node-A-${wall.row}-${wall.col}`);
        const cellB = document.getElementById(`node-B-${wall.row}-${wall.col}`);
        if (cellA) cellA.classList.add('node-wall');
        if (cellB) cellB.classList.add('node-wall');

        // On last wall element, sync React state
        if (idx === walls.length - 1) {
          updateGridsStateSync((g) => g.map(r => r.map(n => ({
            ...n,
            isWall: wallSet.has(`${n.row},${n.col}`)
          }))));
          setIsRunning(false);
        }
      }, idx * 8);

      timeoutsRef.current.push(timeoutId);
    });
  };

  // Perform Pathfinding Visualization
  const handleVisualize = () => {
    if (isRunning) return;
    clearVisuals();
    setIsRunning(true);

    // Determine speed delay
    let delay = 6;
    if (speed === 'medium') delay = 22;
    if (speed === 'slow') delay = 50;

    // Solver runner helper
    const runSolver = (algoName, gridState, start, end) => {
      const t0 = performance.now();
      let result;
      if (algoName === 'BFS') result = solveBFS(gridState, start, end);
      else if (algoName === 'DFS') result = solveDFS(gridState, start, end);
      else if (algoName === 'Dijkstra') result = solveDijkstra(gridState, start, end);
      else if (algoName === 'A*') result = solveAStar(gridState, start, end);
      const t1 = performance.now();
      return {
        ...result,
        timeMs: t1 - t0
      };
    };

    const resA = runSolver(algoA, gridA, startNodeA, endNodeA);
    let resB = null;
    if (isCompareMode) {
      resB = runSolver(algoB, gridB, startNodeB, endNodeB);
    }

    // Animation runner for a single grid
    const animateGrid = (gridId, visited, shortestPath, runTime, onDone) => {
      const totalVisited = visited.length;
      if (totalVisited === 0) {
        onDone(0, 0, runTime);
        return;
      }

      visited.forEach((node, idx) => {
        const timeoutId = setTimeout(() => {
          const el = document.getElementById(`node-${gridId}-${node.row}-${node.col}`);
          if (el && !node.isStart && !node.isEnd) {
            const extraClass = node.weight > 1 ? 'node-visited-weight' : 'node-visited';
            el.classList.add(extraClass);
          }

          // Visited animation completed
          if (idx === totalVisited - 1) {
            if (shortestPath.length > 0) {
              animateShortestPath(gridId, shortestPath, totalVisited, runTime, onDone);
            } else {
              onDone(totalVisited, 0, runTime);
            }
          }
        }, idx * delay);

        timeoutsRef.current.push(timeoutId);
      });
    };

    const animateShortestPath = (gridId, path, totalVisited, runTime, onDone) => {
      path.forEach((node, idx) => {
        const timeoutId = setTimeout(() => {
          const el = document.getElementById(`node-${gridId}-${node.row}-${node.col}`);
          if (el && !node.isStart && !node.isEnd) {
            el.classList.add('node-path');
          }

          if (idx === path.length - 1) {
            onDone(totalVisited, path.length, runTime);
          }
        }, idx * 15);

        timeoutsRef.current.push(timeoutId);
      });
    };

    // Coordination state
    let completedCount = 0;
    const targetCount = isCompareMode ? 2 : 1;

    const onGridComplete = (gridId, vCount, pLength, tMs) => {
      if (gridId === 'A') {
        setStatsA({ visitedCount: vCount, pathLength: pLength, timeMs: tMs });
      } else {
        setStatsB({ visitedCount: vCount, pathLength: pLength, timeMs: tMs });
      }

      completedCount++;
      if (completedCount === targetCount) {
        // Sync final values back to React
        syncReactStatesWithFinalTraces();
        setIsRunning(false);
      }
    };

    const syncReactStatesWithFinalTraces = () => {
      const visitedSetA = new Set(resA.visitedNodesInOrder.map(n => `${n.row},${n.col}`));
      const pathSetA = new Set(resA.shortestPath.map(n => `${n.row},${n.col}`));
      
      setGridA(prev => prev.map(r => r.map(n => ({
        ...n,
        isVisited: visitedSetA.has(`${n.row},${n.col}`),
        isPath: pathSetA.has(`${n.row},${n.col}`)
      }))));

      if (isCompareMode && resB) {
        const visitedSetB = new Set(resB.visitedNodesInOrder.map(n => `${n.row},${n.col}`));
        const pathSetB = new Set(resB.shortestPath.map(n => `${n.row},${n.col}`));
        
        setGridB(prev => prev.map(r => r.map(n => ({
          ...n,
          isVisited: visitedSetB.has(`${n.row},${n.col}`),
          isPath: pathSetB.has(`${n.row},${n.col}`)
        }))));
      }
    };

    // Trigger grid animations
    animateGrid('A', resA.visitedNodesInOrder, resA.shortestPath, resA.timeMs, (v, p, t) => {
      onGridComplete('A', v, p, t);
    });

    if (isCompareMode && resB) {
      animateGrid('B', resB.visitedNodesInOrder, resB.shortestPath, resB.timeMs, (v, p, t) => {
        onGridComplete('B', v, p, t);
      });
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="title-section">
          <h1 className="logo-text text-gradient">Antigravity<span>Pathfinder</span></h1>
          
          <div className="control-group">
            <button 
              className={`btn btn-secondary ${isCompareMode ? 'active' : ''}`}
              onClick={() => {
                if (isRunning) return;
                clearVisuals();
                setIsCompareMode(!isCompareMode);
              }}
              disabled={isRunning}
            >
              📊 {isCompareMode ? 'Exit Comparison' : 'Side-by-Side Compare'}
            </button>
          </div>
        </div>

        <div className="glass-panel controls-bar">
          <div className="control-group">
            <span className="control-label">Algorithm A</span>
            <select
              className="select-input"
              value={algoA}
              onChange={(e) => setAlgoA(e.target.value)}
              disabled={isRunning}
            >
              <option value="BFS">BFS (Unweighted)</option>
              <option value="DFS">DFS (Unweighted)</option>
              <option value="Dijkstra">Dijkstra (Weighted)</option>
              <option value="A*">A* Search (Weighted)</option>
            </select>
          </div>

          {isCompareMode && (
            <div className="control-group">
              <span className="control-label">Algorithm B</span>
              <select
                className="select-input"
                value={algoB}
                onChange={(e) => setAlgoB(e.target.value)}
                disabled={isRunning}
              >
                <option value="BFS">BFS (Unweighted)</option>
                <option value="DFS">DFS (Unweighted)</option>
                <option value="Dijkstra">Dijkstra (Weighted)</option>
                <option value="A*">A* Search (Weighted)</option>
              </select>
            </div>
          )}

          <div className="control-group">
            <span className="control-label">Animation Speed</span>
            <select
              className="select-input"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              disabled={isRunning}
            >
              <option value="fast">Fast (Smooth)</option>
              <option value="medium">Medium</option>
              <option value="slow">Slow</option>
            </select>
          </div>

          <div className="control-group">
            <span className="control-label">Start Node (R, C)</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <input
                type="number"
                min="0"
                max={NUM_ROWS - 1}
                value={startNodeA.row}
                onChange={(e) => handleCoordinateChange('start', 'row', parseInt(e.target.value))}
                disabled={isRunning}
                className="select-input"
                style={{ width: '60px', paddingRight: '0.5rem', backgroundImage: 'none' }}
              />
              <input
                type="number"
                min="0"
                max={NUM_COLS - 1}
                value={startNodeA.col}
                onChange={(e) => handleCoordinateChange('start', 'col', parseInt(e.target.value))}
                disabled={isRunning}
                className="select-input"
                style={{ width: '60px', paddingRight: '0.5rem', backgroundImage: 'none' }}
              />
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">End Node (R, C)</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <input
                type="number"
                min="0"
                max={NUM_ROWS - 1}
                value={endNodeA.row}
                onChange={(e) => handleCoordinateChange('end', 'row', parseInt(e.target.value))}
                disabled={isRunning}
                className="select-input"
                style={{ width: '60px', paddingRight: '0.5rem', backgroundImage: 'none' }}
              />
              <input
                type="number"
                min="0"
                max={NUM_COLS - 1}
                value={endNodeA.col}
                onChange={(e) => handleCoordinateChange('end', 'col', parseInt(e.target.value))}
                disabled={isRunning}
                className="select-input"
                style={{ width: '60px', paddingRight: '0.5rem', backgroundImage: 'none' }}
              />
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Draw Mode</span>
            <div className="tool-toggle">
              <button
                className={`tool-toggle-btn ${toolMode === 'wall' ? 'active' : ''}`}
                onClick={() => setToolMode('wall')}
                disabled={isRunning}
              >
                🧱 Walls
              </button>
              <button
                className={`tool-toggle-btn ${toolMode === 'weight' ? 'active' : ''}`}
                onClick={() => setToolMode('weight')}
                disabled={isRunning}
              >
                ⚓ Weights (5x)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={handleVisualize}
              disabled={isRunning}
            >
              🚀 Visualize Path
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleGenerateMaze}
              disabled={isRunning}
            >
              🌀 Generate Maze
            </button>
            <button
              className="btn btn-accent"
              onClick={clearVisuals}
              disabled={isRunning || (statsA.visitedCount === 0 && statsB.visitedCount === 0)}
            >
              🧹 Clear Path
            </button>
            <button
              className="btn btn-danger"
              onClick={clearGrid}
              disabled={isRunning}
            >
              🗑️ Clear Grid
            </button>
          </div>
        </div>
      </header>

      <div className="glass-panel help-bar" style={{ marginBottom: '1.5rem' }}>
        <span className="help-icon">💡 Guide:</span>
        <span>
          {toolMode === 'wall' 
            ? 'Click and drag on empty cells to paint walls. Grab and drag Start 🟢 or Target 🔴 to move them.' 
            : 'Click and drag on empty cells to paint high-cost weight (5x) obstacles (⚓ symbols).'}
        </span>
      </div>

      {/* Main Workspace rendering based on mode */}
      {!isCompareMode ? (
        <main className="main-workspace">
          <div className="workspace-left">
            {gridA.length > 0 && (
              <Grid
                grid={gridA}
                onNodeMouseDown={(r, c) => handleMouseDown(r, c)}
                onNodeMouseEnter={(r, c) => handleMouseEnter(r, c)}
                onNodeMouseUp={handleMouseUp}
                gridId="A"
              />
            )}
          </div>
          <div className="workspace-right">
            <Stats
              algorithmName={algoA}
              visitedCount={statsA.visitedCount}
              pathLength={statsA.pathLength}
              timeMs={statsA.timeMs}
              isRunning={isRunning}
            />
            <Legend />
          </div>
        </main>
      ) : (
        <main className="dual-workspace">
          <div className="dual-grids-container">
            <div className="grid-column">
              <div className="glass-panel grid-column-title" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                <span className="grid-header-title">Grid A: {algoA}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  Time: {statsA.timeMs !== null ? `${statsA.timeMs.toFixed(1)}ms` : '-'} | Steps: {statsA.pathLength || '-'}
                </span>
              </div>
              {gridA.length > 0 && (
                <Grid
                  grid={gridA}
                  onNodeMouseDown={(r, c) => handleMouseDown(r, c)}
                  onNodeMouseEnter={(r, c) => handleMouseEnter(r, c)}
                  onNodeMouseUp={handleMouseUp}
                  gridId="A"
                />
              )}
            </div>

            <div className="grid-column">
              <div className="glass-panel grid-column-title" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
                <span className="grid-header-title">Grid B: {algoB}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  Time: {statsB.timeMs !== null ? `${statsB.timeMs.toFixed(1)}ms` : '-'} | Steps: {statsB.pathLength || '-'}
                </span>
              </div>
              {gridB.length > 0 && (
                <Grid
                  grid={gridB}
                  onNodeMouseDown={(r, c) => handleMouseDown(r, c)}
                  onNodeMouseEnter={(r, c) => handleMouseEnter(r, c)}
                  onNodeMouseUp={handleMouseUp}
                  gridId="B"
                />
              )}
            </div>
          </div>
          <Legend />
        </main>
      )}
    </div>
  );
}

export default App;
