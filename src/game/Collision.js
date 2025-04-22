// src/game/Collision.js
import * as THREE from 'three'; // Add this import

/**
 * Checks if the piece's current position and orientation are valid within the grid.
 * A position is valid if all its blocks are within the grid boundaries and
 * do not overlap with occupied cells in the grid.
 *
 * @param {Grid} grid - The game grid instance.
 * @param {Piece} piece - The piece instance to check.
 * @returns {boolean} True if the position is valid, false otherwise (collision detected).
 */
export const isValidPosition = (grid, piece) => {
  const worldCoords = piece.getWorldBlockCoordinates();

  for (const coord of worldCoords) {
    const x = Math.round(coord.x);
    const y = Math.round(coord.y);
    const z = Math.round(coord.z);

    // 1. Check Grid Boundaries
    if (!grid.isInBounds(x, y, z)) {
      // Specifically check if below the floor (y < 0) which is a common collision
      if (y < 0) {
         // console.log(`Collision: Below floor at y=${y}`);
      } else {
         // console.log(`Collision: Out of bounds at (${x}, ${y}, ${z})`);
      }
      return false; // Collision with boundary
    }

    // 2. Check Against Settled Pieces
    // Note: grid.isOccupied already handles bounds check internally,
    // but we check explicitly above for clarity and potentially different handling.
    if (grid.isOccupied(x, y, z)) {
      // console.log(`Collision: Occupied cell at (${x}, ${y}, ${z})`);
      return false; // Collision with a settled piece
    }
  }

  // If all blocks are in valid positions
  return true;
};

/**
 * Calculates the final resting position of a piece if dropped straight down.
 * @param {Grid} grid - The game grid.
 * @param {Piece} piece - The piece to drop.
 * @returns {Piece | null} A new Piece object representing the ghost piece at its final position, or null if no piece provided.
 */
export function calculateGhostPosition(grid, piece) {
  if (!piece) return null; // No piece, no ghost

  let ghostPiece = piece.clone(); // Start with the current piece position

  // Move down step by step until an invalid position is found
  while (true) {
    const testPiece = ghostPiece.clone();
    testPiece.move(new THREE.Vector3(0, -1, 0)); // Try moving down one step
    if (isValidPosition(grid, testPiece)) {
      ghostPiece = testPiece; // If valid, update the ghost position
    } else {
      break; // If invalid, the previous position was the final one
    }
  }
  return ghostPiece;
}


// Example usage (conceptual - would be in GameController or similar):
/*
import { isValidPosition } from './Collision';
import Grid from './Grid';
import Piece from './pieces/Piece';

const grid = new Grid();
const piece = new Piece('T'); // Assume Piece constructor sets initial position

// Try moving the piece down
const testPiece = piece.clone(); // Clone to test hypothetical move
testPiece.move(new THREE.Vector3(0, -1, 0));

if (isValidPosition(grid, testPiece)) {
  // Move is valid, update the actual piece
  piece.move(new THREE.Vector3(0, -1, 0));
} else {
  // Move is invalid (collision), handle settling the piece
  grid.addPiece(piece);
  // Spawn new piece, etc.
}

// Try rotating the piece
const rotatedPiece = piece.clone();
rotatedPiece.rotateY(); // Example rotation

if (isValidPosition(grid, rotatedPiece)) {
    // Rotation is valid, update the actual piece
    piece.rotateY();
} else {
    // Rotation is invalid, potentially try wall kicks or just disallow
    console.log("Rotation blocked by collision");
}
*/