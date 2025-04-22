// src/hooks/useGameLoop.js
import { useEffect, useRef } from 'react';
import useGameStore from '../state/gameStore';
import * as THREE from 'three';

// Base interval time (milliseconds) for level 1
const BASE_INTERVAL = 3000; // Slower start: 3 seconds per step at level 1
// How much faster each level gets (adjust as needed)
const LEVEL_SPEED_MULTIPLIER = 0.85; // e.g., level 2 is 85% of level 1 interval

const MOVE_DOWN = new THREE.Vector3(0, -1, 0);

const useGameLoop = () => {
  const gameState = useGameStore((state) => state.gameState);
  const level = useGameStore((state) => state.level);
  const movePiece = useGameStore((state) => state.movePiece);
  const intervalIdRef = useRef(null);

  useEffect(() => {
    // Function to start the game loop interval
    const startGameInterval = (currentLevel) => {
      // Clear any existing interval
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }

      // Calculate interval based on level
      // Ensure interval doesn't become too fast or negative
      const intervalTime = Math.max(100, BASE_INTERVAL * Math.pow(LEVEL_SPEED_MULTIPLIER, currentLevel - 1));

      intervalIdRef.current = setInterval(() => {
        // This check ensures we don't try to move if the state changed between interval setting and execution
        if (useGameStore.getState().gameState === 'Playing') {
          // Attempt to move the piece down
          movePiece(MOVE_DOWN);
          // Note: The movePiece action in the store already handles collision
          // and triggers settlePiece if the downward move fails.
        }
      }, intervalTime);
    };

    // Function to stop the game loop interval
    const stopGameInterval = () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };

    // Manage interval based on game state
    if (gameState === 'Playing') {
      startGameInterval(level);
    } else {
      stopGameInterval();
    }

    // Cleanup function to clear interval when the component unmounts
    // or when dependencies change causing the effect to re-run
    return () => {
      stopGameInterval();
    };

  }, [gameState, level, movePiece]); // Dependencies: Re-run effect if state, level, or move action changes

  // This hook doesn't return anything, it manages the game loop side effect
};

export default useGameLoop;