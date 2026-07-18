/**
 * Breadth-First Search (BFS) algorithm.
 * BFS is an unweighted algorithm that guarantees the shortest path.
 * 
 * Time Complexity: O(V + E)
 *   - V = number of vertices (nodes) in the grid = Row x Col.
 *   - E = number of edges (connections) = 4 per node.
 *   - In the worst case, we visit every node and check its 4 neighbors.
 * 
 * Space Complexity: O(V)
 *   - Used for the queue to store nodes to visit and visited node track.
 */

export function solve(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const clonedGrid = grid.map(row => 
    row.map(node => ({
      ...node,
      isVisited: false,
      distance: Infinity,
      previousNode: null,
    }))
  );

  const start = clonedGrid[startNode.row][startNode.col];
  const end = clonedGrid[endNode.row][endNode.col];

  const queue = [start];
  start.isVisited = true;
  start.distance = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    
    // Add to visited nodes list (exclude start node from visualization visited color if preferred, 
    // but usually we include it or exclude it; here we include all visited for animation)
    visitedNodesInOrder.push(current);

    if (current.row === end.row && current.col === end.col) {
      return {
        visitedNodesInOrder,
        shortestPath: getShortestPath(current)
      };
    }

    const neighbors = getNeighbors(current, clonedGrid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        neighbor.isVisited = true;
        neighbor.distance = current.distance + 1;
        neighbor.previousNode = current;
        queue.push(neighbor);
      }
    }
  }

  // End node not reached
  return {
    visitedNodesInOrder,
    shortestPath: []
  };
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Check 4 directions: Up, Down, Left, Right
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < numCols - 1) neighbors.push(grid[row][col + 1]);

  return neighbors;
}

function getShortestPath(endNode) {
  const path = [];
  let current = endNode;
  while (current !== null) {
    path.unshift(current);
    current = current.previousNode;
  }
  return path;
}
