/**
 * Depth-First Search (DFS) algorithm.
 * DFS is an unweighted algorithm that does NOT guarantee the shortest path.
 * It explores as deep as possible along each branch before backtracking.
 * 
 * Time Complexity: O(V + E)
 *   - V = Row x Col.
 *   - E = 4 edges per node.
 *   - In the worst case, we visit every node and check its neighbors.
 * 
 * Space Complexity: O(V)
 *   - Used for the stack to track path exploration and visited status.
 */

export function solve(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const clonedGrid = grid.map(row => 
    row.map(node => ({
      ...node,
      isVisited: false,
      previousNode: null,
    }))
  );

  const start = clonedGrid[startNode.row][startNode.col];
  const end = clonedGrid[endNode.row][endNode.col];

  const stack = [start];
  start.isVisited = true;

  while (stack.length > 0) {
    const current = stack.pop();
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
        neighbor.previousNode = current;
        stack.push(neighbor);
      }
    }
  }

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

  // Ordering of neighbors determines the DFS path bias (e.g. Up, Right, Down, Left)
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (col < numCols - 1) neighbors.push(grid[row][col + 1]);
  if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);

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
