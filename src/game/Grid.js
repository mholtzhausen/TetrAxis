// src/game/Grid.js
import * as THREE from 'three';

class Grid {
  constructor(width = 10, height = 20, depth = 10) {
    this.width = width;
    this.height = height;
    this.depth = depth;

    // Initialize the 3D array with null values (representing empty cells)
    this.cells = Array(this.width).fill(null).map(() =>
      Array(this.height).fill(null).map(() =>
        Array(this.depth).fill(null)
      )
    );
  }

  /**
   * Checks if a given coordinate is within the grid boundaries.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean} True if the coordinate is within bounds, false otherwise.
   */
  isInBounds(x, y, z) {
    return x >= 0 && x < this.width &&
           y >= 0 && y < this.height &&
           z >= 0 && z < this.depth;
  }

  /**
   * Checks if a cell at the given coordinate is occupied by a settled piece.
   * Assumes coordinates are already validated or will be checked with isInBounds.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean} True if the cell is occupied, false otherwise.
   */
  isOccupied(x, y, z) {
    // Check bounds first to prevent errors accessing invalid indices
    if (!this.isInBounds(x, y, z)) {
      return true; // Treat out-of-bounds as occupied for collision purposes
    }
    return this.cells[x][y][z] !== null;
  }

  /**
   * Adds a settled piece to the grid.
   * Iterates through the piece's blocks and updates the corresponding grid cells.
   * @param {Piece} piece - The piece that has settled.
   */
  addPiece(piece) {
    const worldCoords = piece.getWorldBlockCoordinates();
    worldCoords.forEach(coord => {
      // Round coordinates to ensure they align with grid indices
      const x = Math.round(coord.x);
      const y = Math.round(coord.y);
      const z = Math.round(coord.z);

      if (this.isInBounds(x, y, z)) {
        // Store the piece's color (or type) in the grid cell
        this.cells[x][y][z] = piece.color; // Or piece.type
      } else {
        // This case should ideally be prevented by collision detection,
        // but log a warning if it happens.
        console.warn(`Attempted to add piece block out of bounds at (${x}, ${y}, ${z})`);
      }
    });
  }

  /**
   * Checks a specific horizontal layer (Y-plane) for completion.
   * @param {number} y - The Y-level of the layer to check.
   * @returns {boolean} True if the layer is completely filled, false otherwise.
   */
  isLayerComplete(y) {
    if (y < 0 || y >= this.height) {
      return false; // Layer index out of bounds
    }
    for (let x = 0; x < this.width; x++) {
      for (let z = 0; z < this.depth; z++) {
        if (this.cells[x][y][z] === null) {
          return false; // Found an empty cell, layer is not complete
        }
      }
    }
    return true; // All cells in the layer are occupied
  }

  /**
   * Clears a specific horizontal layer and shifts layers above it down.
   * @param {number} yLayer - The Y-level of the layer to clear.
   */
  clearLayerAndShiftDown(yLayer) {
    if (yLayer < 0 || yLayer >= this.height) {
      console.warn(`Attempted to clear invalid layer: ${yLayer}`);
      return;
    }

    // Shift layers down: Start from the cleared layer up to the top
    for (let y = yLayer; y < this.height - 1; y++) {
      for (let x = 0; x < this.width; x++) {
        for (let z = 0; z < this.depth; z++) {
          this.cells[x][y][z] = this.cells[x][y + 1][z];
        }
      }
    }

    // Clear the top layer (it's now empty after shifting)
    for (let x = 0; x < this.width; x++) {
      for (let z = 0; z < this.depth; z++) {
        this.cells[x][this.height - 1][z] = null;
      }
    }
  }

  /**
   * Checks all layers for completion and clears them, returning the count.
   * Iterates from bottom to top is more efficient for multiple clears.
   * @returns {number} The number of layers cleared.
   */
  checkAndClearCompletedLayers() {
    let linesCleared = 0;
    // Iterate from bottom layer upwards
    for (let y = 0; y < this.height; y++) {
      if (this.isLayerComplete(y)) {
        this.clearLayerAndShiftDown(y);
        linesCleared++;
        // Since layers shifted down, re-check the current y-level
        y--;
      }
    }
    return linesCleared;
  }

   /**
   * Resets the grid to its initial empty state.
   */
  reset() {
     this.cells = Array(this.width).fill(null).map(() =>
      Array(this.height).fill(null).map(() =>
        Array(this.depth).fill(null)
      )
    );
  }
}

export default Grid;