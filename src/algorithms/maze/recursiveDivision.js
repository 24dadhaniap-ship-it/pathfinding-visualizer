/**
 * Recursive Division Maze Generation Algorithm.
 * 
 * Works by dividing the grid area in half with a wall, leaving a single passage open,
 * and recursively dividing the resulting sub-areas.
 * 
 * This implementation generates a list of wall coordinates in the order they should
 * be painted so they can be animated nicely.
 */

export function generateMaze(rows, cols, startNode, endNode) {
  const wallsToAnimate = [];

  // Add outer border walls first (excluding start/end)
  for (let r = 0; r < rows; r++) {
    if (r !== startNode.row && r !== endNode.row) {
      wallsToAnimate.push({ row: r, col: 0 });
      wallsToAnimate.push({ row: r, col: cols - 1 });
    }
  }
  for (let c = 0; c < cols; c++) {
    if (c !== startNode.col && c !== endNode.col) {
      wallsToAnimate.push({ row: 0, col: c });
      wallsToAnimate.push({ row: rows - 1, col: c });
    }
  }

  function divide(rStart, rEnd, cStart, cEnd) {
    if (rEnd - rStart < 2 || cEnd - cStart < 2) return;

    const width = cEnd - cStart;
    const height = rEnd - rStart;
    const isHorizontal = height > width;

    if (isHorizontal) {
      // Horizontal wall: split area top and bottom
      let wallRow = getRandomOddNumber(rStart + 1, rEnd - 1);
      let passageCol = getRandomEvenNumber(cStart, cEnd);

      if (wallRow === null || passageCol === null) return;

      // Draw the wall, leaving the passage open
      for (let c = cStart; c <= cEnd; c++) {
        if (c !== passageCol) {
          // Never overwrite start or end
          if ((wallRow !== startNode.row || c !== startNode.col) &&
              (wallRow !== endNode.row || c !== endNode.col)) {
            wallsToAnimate.push({ row: wallRow, col: c });
          }
        }
      }

      // Recurse above and below
      divide(rStart, wallRow - 1, cStart, cEnd);
      divide(wallRow + 1, rEnd, cStart, cEnd);
    } else {
      // Vertical wall: split area left and right
      let wallCol = getRandomOddNumber(cStart + 1, cEnd - 1);
      let passageRow = getRandomEvenNumber(rStart, rEnd);

      if (wallCol === null || passageRow === null) return;

      // Draw the wall, leaving the passage open
      for (let r = rStart; r <= rEnd; r++) {
        if (r !== passageRow) {
          // Never overwrite start or end
          if ((r !== startNode.row || wallCol !== startNode.col) &&
              (r !== endNode.row || wallCol !== endNode.col)) {
            wallsToAnimate.push({ row: r, col: wallCol });
          }
        }
      }

      // Recurse left and right
      divide(rStart, rEnd, cStart, wallCol - 1);
      divide(rStart, rEnd, wallCol + 1, cEnd);
    }
  }

  // Begin division within the inner grid region (excluding outer walls)
  divide(1, rows - 2, 1, cols - 2);

  return wallsToAnimate;
}

function getRandomOddNumber(min, max) {
  const odds = [];
  for (let i = min; i <= max; i++) {
    if (i % 2 !== 0) odds.push(i);
  }
  if (odds.length === 0) return null;
  return odds[Math.floor(Math.random() * odds.length)];
}

function getRandomEvenNumber(min, max) {
  const evens = [];
  for (let i = min; i <= max; i++) {
    if (i % 2 === 0) evens.push(i);
  }
  if (evens.length === 0) return null;
  return evens[Math.floor(Math.random() * evens.length)];
}
