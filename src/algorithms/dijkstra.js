/**
 * Dijkstra's Algorithm.
 * Dijkstra is a weighted shortest-path algorithm.
 * It guarantees the shortest path on grids with non-negative cell weights.
 * 
 * Time Complexity: O(V^2) (using simple array sorting/scan) or O((V + E) log V) with a Min-Heap.
 *   - On our 25x50 grid, V = 1250. V^2 is about 1.5 million operations in the absolute worst case,
 *     which executes in ~1-2ms in modern JavaScript engines.
 * 
 * Space Complexity: O(V)
 *   - Used for keeping track of distances and visiting orders.
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

  start.distance = 0;
  const unvisitedNodes = getAllNodes(clonedGrid);

  while (unvisitedNodes.length > 0) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();

    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) break;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode.row === end.row && closestNode.col === end.col) {
      return {
        visitedNodesInOrder,
        shortestPath: getShortestPath(closestNode)
      };
    }

    updateUnvisitedNeighbors(closestNode, clonedGrid);
  }

  return {
    visitedNodesInOrder,
    shortestPath: []
  };
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function sortNodesByDistance(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node, grid) {
  const neighbors = getNeighbors(node, grid);
  const unvisitedNeighbors = neighbors.filter(neighbor => !neighbor.isVisited);
  for (const neighbor of unvisitedNeighbors) {
    // Each transition costs neighbor.weight (default 1, swamp is 5)
    const tentativeDistance = node.distance + neighbor.weight;
    if (tentativeDistance < neighbor.distance) {
      neighbor.distance = tentativeDistance;
      neighbor.previousNode = node;
    }
  }
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;

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
