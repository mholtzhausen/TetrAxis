// src/state/gameStore.js
import { create } from 'zustand';
import * as THREE from 'three';
import Grid from '../game/Grid.js'; // Assuming Grid class is here
import Piece from '../game/pieces/Piece.js'; // Assuming Piece class is here
import { getRandomTetrominoType } from '../game/pieces/TetrominoData.js';
import { isValidPosition } from '../game/Collision.js'; // Import collision checker

// --- Constants ---
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const GRID_DEPTH = 10;
// Lower the starting Y position to prevent spawning outside the grid top
const START_POS = new THREE.Vector3(Math.floor(GRID_WIDTH / 2) -1, GRID_HEIGHT - 3, Math.floor(GRID_DEPTH / 2) -1); // Y=17

// --- Helper Functions ---
const createNewGrid = () => new Grid(GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH);
const createNewPiece = (type) => new Piece(type || getRandomTetrominoType(), START_POS.clone());

// --- Zustand Store Definition ---
const useGameStore = create((set, get) => ({
  // --- State Properties ---
  grid: createNewGrid(),
  currentPiece: null, // Initially no piece
  nextPiece: createNewPiece(), // Generate the first 'next' piece
  score: 0,
  level: 1,
  linesCleared: 0,
  gameState: 'StartScreen', // 'Playing', 'Paused', 'GameOver'

  // --- Basic Setters (Internal use or direct updates) ---
  _setGridState: (newGridState) => set({ grid: newGridState }),
  _setCurrentPieceState: (piece) => set({ currentPiece: piece }),
  _setNextPieceState: (piece) => set({ nextPiece: piece }),

  // --- Game Flow Actions ---
  startGame: () => {
    console.log("[gameStore] startGame called"); // Log action call
    const firstPiece = get().nextPiece; // Use the pre-generated next piece
    const nextPiece = createNewPiece(); // Generate the new next piece
    console.log("[gameStore] Setting state to Playing with first piece:", firstPiece);
    set({
      grid: createNewGrid(), // Reset grid
      currentPiece: firstPiece,
      nextPiece: nextPiece,
      score: 0,
      level: 1,
      linesCleared: 0,
      gameState: 'Playing',
    });
    // Initial check in case the start position is invalid (unlikely but safe)
    const currentGrid = get().grid;
    const currentPieceAfterSet = get().currentPiece;
    if (!currentPieceAfterSet) {
        console.error("[gameStore] startGame: currentPiece is null after setting state!");
        return; // Should not happen
    }
    if (!isValidPosition(currentGrid, currentPieceAfterSet)) {
        console.warn("[gameStore] startGame: Initial position invalid! Calling endGame.");
        get().endGame(); // Game over immediately if start is blocked
    } else {
        console.log("[gameStore] startGame: Initial position valid.");
    }
  },

  pauseGame: () => {
    if (get().gameState === 'Playing') {
      set({ gameState: 'Paused' });
    }
  },

  resumeGame: () => {
    if (get().gameState === 'Paused') {
      set({ gameState: 'Playing' });
    }
  },

  endGame: () => {
    console.log("[gameStore] endGame called"); // Log action call
    set({ gameState: 'GameOver' });
  },

  // --- Piece Management Actions ---
  spawnNewPiece: () => {
    console.log("[gameStore] spawnNewPiece called"); // Log action
    const newCurrentPiece = get().nextPiece;
    const newNextPiece = createNewPiece(); // Generate the next one

    // Check if the spawn position is valid
    const currentGrid = get().grid;
    const spawnCoords = newCurrentPiece.getWorldBlockCoordinates(); // Check the piece *before* setting it
    console.log(`[gameStore] Attempting to spawn ${newCurrentPiece.type} at coords:`, spawnCoords.map(c => `(${c.x},${c.y},${c.z})`).join(' '));
    const validSpawn = isValidPosition(currentGrid, newCurrentPiece);
    console.log("[gameStore] isValidPosition for spawn:", validSpawn);

    if (!validSpawn) {
      // Cannot spawn piece, game over
      console.warn("[gameStore] Spawn position invalid! Calling endGame.");
      get().endGame();
      set({ currentPiece: null }); // Clear current piece on game over
    } else {
      console.log("[gameStore] Spawn position valid.");
      set({
        currentPiece: newCurrentPiece,
        nextPiece: newNextPiece,
      });
    }
  },

  // --- Piece Movement/Rotation Actions (with Collision Checks) ---
  movePiece: (offset) => {
    const { grid, currentPiece, gameState } = get();
    if (!currentPiece || gameState !== 'Playing') return;

    const testPiece = currentPiece.clone();
    testPiece.move(offset);

    if (isValidPosition(grid, testPiece)) {
      set({ currentPiece: testPiece }); // Update state with the valid new piece position
      return true; // Move was successful
    } else {
      // If moving down failed, it means the piece has landed
      if (offset.y < 0) {
        get().settlePiece();
      }
      return false; // Move failed
    }
  },

  rotatePiece: (axis) => {
    const { grid, currentPiece, gameState } = get();
    if (!currentPiece || gameState !== 'Playing') return;

    const testPiece = currentPiece.clone();
    testPiece.rotate(axis); // Use the generic rotate method from Piece class

    if (isValidPosition(grid, testPiece)) {
      set({ currentPiece: testPiece }); // Update state with the valid new rotation
    } else {
      // Optional: Implement wall kick logic here
      // If wall kick fails or isn't implemented, rotation is blocked.
      console.log("Rotation blocked");
    }
  },

  // --- Game Logic Actions ---
  settlePiece: () => {
    const { grid, currentPiece } = get();
    if (!currentPiece) return;

    const newGrid = grid; // Direct mutation for simplicity here, or clone if needed
    newGrid.addPiece(currentPiece); // Add the current piece to the grid state

    const linesClearedCount = newGrid.checkAndClearCompletedLayers();

    if (linesClearedCount > 0) {
      // Update score and potentially level based on lines cleared
      const points = get().calculateScore(linesClearedCount);
      get().addScore(points);
      get().incrementLinesCleared(linesClearedCount);
      // Optional: Update level based on lines cleared
      // get().updateLevel();
    }

    // Update grid state in the store (important!)
    // This might need adjustment if Grid methods don't mutate directly
    // or if you prefer immutable updates.
    set({ grid: newGrid, currentPiece: null }); // Clear current piece

    // Spawn the next piece
    get().spawnNewPiece();
  },

  // --- Scoring/Level Actions ---
  addScore: (points) => set((state) => ({ score: state.score + points })),
  incrementLinesCleared: (count) => set((state) => ({ linesCleared: state.linesCleared + count })),
  setLevel: (level) => set({ level: level }),
  // Example scoring logic (customize as needed)
  calculateScore: (linesClearedCount) => {
      const basePoints = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines
      return (basePoints[linesClearedCount] || 0) * get().level;
  },
  // Example level update logic
  // updateLevel: () => set((state) => {
  //    const newLevel = Math.floor(state.linesCleared / 10) + 1;
  //    return { level: Math.max(state.level, newLevel) };
  // }),

}));

export default useGameStore;