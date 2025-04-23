// src/hooks/useInputHandler.js
import { useEffect } from 'react';
import * as THREE from 'three';
import useGameStore from '../state/gameStore';

// Define movement offsets
const MOVE_LEFT = new THREE.Vector3(-1, 0, 0);
const MOVE_RIGHT = new THREE.Vector3(1, 0, 0);
const MOVE_FORWARD = new THREE.Vector3(0, 0, -1); // Assuming -Z is forward
const MOVE_BACKWARD = new THREE.Vector3(0, 0, 1); // Assuming +Z is backward
const MOVE_DOWN = new THREE.Vector3(0, -1, 0);

// Define rotation axes (ensure consistency with Piece.js if imported separately)
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

const useInputHandler = () => {
  // Get actions and state selector from the store
  const movePiece = useGameStore((state) => state.movePiece);
  const rotatePiece = useGameStore((state) => state.rotatePiece);
  const gameState = useGameStore((state) => state.gameState);
  // Add pause/resume/start actions if needed for keyboard control
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const startGame = useGameStore((state) => state.startGame); // If starting via key

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle inputs if the game is in the 'Playing' state
      if (gameState === 'Playing') {
        switch (event.key) {
          // Movement
          case 'ArrowLeft':
          case 'a': // Common alternative
            event.preventDefault(); // Prevent browser scrolling
            movePiece(MOVE_LEFT);
            break;
          case 'ArrowRight':
          case 'd': // Common alternative
            event.preventDefault();
            movePiece(MOVE_RIGHT);
            break;
          case 'ArrowUp': // Use for forward movement on Z-axis
          case 'w':
             event.preventDefault();
             movePiece(MOVE_FORWARD);
             break;
          case 'ArrowDown': // Use for backward movement on Z-axis
          case 's':
             event.preventDefault();
             movePiece(MOVE_BACKWARD);
             break;
          case ' ': // Space for fast drop (move down)
             event.preventDefault();
             movePiece(MOVE_DOWN);
             // Could implement a "hard drop" logic here later
             break;

          // Rotation (Example mapping - adjust as preferred)
          case 'q': // Rotate around Y (Yaw) - Counter-clockwise
            event.preventDefault();
            rotatePiece(AXIS_Y); // Assuming positive Y rotation is CCW
            break;
          case 'e': // Rotate around Y (Yaw) - Clockwise
            event.preventDefault();
            // Need to rotate by -PI/2 or apply inverse quaternion logic
            // For simplicity, let's stick to one direction per axis for now
            // or adjust Piece.js to handle negative angles.
            // As a placeholder, let's rotate the other way for demo
             const tempQuatY = new THREE.Quaternion().setFromAxisAngle(AXIS_Y, -Math.PI / 2);
             // This requires modifying rotatePiece or Piece class to accept quaternion
             // rotatePiece(tempQuatY); // Placeholder - requires store/Piece modification
             console.warn("Clockwise Y rotation needs implementation adjustment.");
             // For now, let's just rotate the standard way
             rotatePiece(AXIS_Y);
            break;
          case 'r': // Rotate around X (Pitch)
            event.preventDefault();
            rotatePiece(AXIS_X);
            break;
          case 'f': // Rotate around Z (Roll)
            event.preventDefault();
            rotatePiece(AXIS_Z);
            break;

          // Game State
          case 'Enter': // Pause when playing
            event.preventDefault();
            pauseGame();
            break;

          default:
            break;
        }
      } else if (gameState === 'Paused') {
          // Allow resuming from pause with Enter
          if (event.key === 'Enter') {
              event.preventDefault();
              resumeGame();
          }
          // Allow resuming with P as well? (Decide if needed)
          // else if (event.key === 'p') {
          //     event.preventDefault();
          //     resumeGame();
          // }
      } else if (gameState === 'StartScreen' || gameState === 'GameOver') {
          // Allow starting/restarting the game with Enter
          if (event.key === 'Enter') {
              event.preventDefault();
              startGame();
          }
      }
      // Redundant 'Playing' check removed, handled in the main switch now.
      // else if (gameState === 'Playing') {
      //     // Allow pausing with Enter when playing
      //     if (event.key === 'Enter') {
      //         event.preventDefault();
      //         pauseGame();
      //     }
      // }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, movePiece, rotatePiece, pauseGame, resumeGame, startGame]); // Re-run effect if these change

  // This hook doesn't need to return anything, it just sets up listeners
};

export default useInputHandler;