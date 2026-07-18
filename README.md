# Pathfinding Visualizer

An interactive grid-based tool that visualizes how different pathfinding algorithms explore a 2D grid to search for the shortest path between a start and target node. Built using React and Vite, utilizing high-performance CSS animation bindings to render explorations in real time without lag.

## Algorithms Implemented

### 1. Breadth-First Search (BFS)
* **Type**: Unweighted.
* **Mechanism**: Explores neighbors layer-by-layer using a FIFO Queue. Visited cells radiate outwards in circular fronts.
* **Shortest Path Guarantee**: Yes.

### 2. Depth-First Search (DFS)
* **Type**: Unweighted.
* **Mechanism**: Explores down each path branch as deep as possible using a LIFO Stack before backtracking.
* **Shortest Path Guarantee**: No (often results in winding, sub-optimal paths).

### 3. Dijkstra's Algorithm
* **Type**: Weighted.
* **Mechanism**: Selects the node with the absolute minimum tentative distance to explore next. 
* **Shortest Path Guarantee**: Yes (routes around high-cost weighted cells if a cheaper path exists).

### 4. A* Search
* **Type**: Weighted.
* **Mechanism**: Combines path cost from the start node ($g(n)$) with an estimated cost to the target ($h(n)$) using the **Manhattan Distance** heuristic. Explores cells with the minimum $f(n) = g(n) + h(n)$ first.
* **Shortest Path Guarantee**: Yes (highly optimized, expanding far fewer nodes than Dijkstra).

---

## Complexity Comparison Table

| Algorithm | Time Complexity | Space Complexity | Shortest Path Guarantee? | Handles Weights? |
| :--- | :--- | :--- | :--- | :--- |
| **BFS** | $O(V + E)$ | $O(V)$ | Yes | No |
| **DFS** | $O(V + E)$ | $O(V)$ | No | No |
| **Dijkstra** | $O(V^2)$ (Array-based) | $O(V)$ | Yes | Yes |
| **A* Search** | $O(V^2)$ (Worst case) / $O(E \log V)$ (Avg) | $O(V)$ | Yes | Yes |

*Note: In the grid, $V$ (vertices) is the total number of cells ($Rows \times Cols = 20 \times 40 = 800$), and $E$ (edges) represents the 4 cardinal transitions per cell.*

---

## Maze Generation: Recursive Division

The maze generator uses the **Recursive Division** algorithm. 
1. It draws outer border walls around the grid.
2. It divides the grid either horizontally or vertically along an odd row/column and leaves a single passage open at an even row/column.
3. It recursively applies the division step to the resulting sub-grids.
This ensures a fully-enclosed maze that is guaranteed to have solvable pathways between the start and end nodes.

---

## Features Guide

1. **Interactive Node Placement**: Grab the green start circle 🟢 or red target circle 🔴 with your mouse and drag them to relocate.
2. **Draw Mode Toggle**:
   - **Walls (🧱)**: Click and drag over cells to draw impenetrable black obstacles.
   - **Weights (⚓)**: Click and drag to place high-cost "swamp" terrain (costs 5x units to traverse, marked by anchor symbols).
3. **Maze Generator**: Instantly generate grid-aligned walls with Recursive Division.
4. **Side-by-Side Comparison**: Toggle comparison mode to display two grids side-by-side. You can select different algorithms (e.g. A* on Grid A, Dijkstra on Grid B) and watch them run concurrently on identical obstacle configurations to see how heuristics target paths faster than standard Dijkstra.
5. **Real-time Performance Metrics**: Displays cells explored, path length, and execution speed in milliseconds.
6. **Coordinate Inputs**: If you prefer precise positioning, type the coordinates (row, col) into the **Start Node (R, C)** and **End Node (R, C)** inputs in the header controls bar. Values are clamped within valid boundaries and automatically synced between grids.

---

## How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Navigate to the project directory:
   ```bash
   cd "c:\Users\pratham dadhania\OneDrive\Desktop\g9"
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the browser and visit:
   `http://localhost:5174/` (or the port specified in your terminal log).
