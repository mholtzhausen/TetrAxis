// src/App.jsx
import React from 'react';
import TetrisCanvas from './rendering/TetrisCanvas';
import useGameStore from './state/gameStore';
import NextPiecePreview from './components/NextPiecePreview'; // Import the new component
import ControlsReference from './components/ControlsReference'; // Import the controls reference
import './App.css'; // We'll create this for basic styling

// Basic UI Components (can be moved to separate files later)

const ScoreDisplay = () => {
  const score = useGameStore((state) => state.score);
  return <div className="info-display">Score: {score}</div>;
};

const LevelDisplay = () => {
  const level = useGameStore((state) => state.level);
  return <div className="info-display">Level: {level}</div>;
};

const GameStateDisplay = () => {
  const gameState = useGameStore((state) => state.gameState);
  let message = '';
  switch (gameState) {
    case 'StartScreen':
      message = 'Press Enter to Start';
      break;
    case 'Paused':
      message = 'Paused (Press Enter to Resume)';
      break;
    case 'GameOver':
      message = 'Game Over! (Press Enter to Restart)';
      break;
    default:
      message = ''; // Playing state doesn't need a persistent message
  }
  return message ? <div className="game-state-message">{message}</div> : null;
};

const Controls = () => {
  // Select only the state needed for conditional rendering
  const gameState = useGameStore((state) => state.gameState);
  // Get actions directly - Zustand ensures stable references for these
  const startGame = useGameStore((state) => state.startGame);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  // const startDemo = useGameStore((state) => state.startDemo); // Get demo actions - Removed
  // const stopDemo = useGameStore((state) => state.stopDemo); // Removed

  return (
    <div className="controls">
      {/* Show Start/Demo buttons when not playing */}
      {/* Start Game button removed - handled by Enter key */}
      {/* {(gameState === 'StartScreen' || gameState === 'GameOver') && (
        <>
          <button onClick={startGame}>Start Game</button>
          {/* <button onClick={startDemo}>Run Demo</button> */} {/* Removed */}
        {/* </>
      )} */}
      {/* Pause/Resume buttons removed - handled by Enter key */}
      {/* {gameState === 'Playing' && (
        <button onClick={pauseGame}>Pause (P)</button>
      )} */}
      {/* {gameState === 'Paused' && (
        <button onClick={resumeGame}>Resume (P)</button>
      )} */}
      {/* Demo controls removed */}
      {/* {gameState === 'Demo' && (
        <button onClick={stopDemo}>Stop Demo</button>
      )} */}
    </div>
  );
};


function App() {
  // useAIDemoLoop(); // Initialize the AI demo loop hook - Removed

  return (
    <div className="App">
      {/* Title moved to UI Panel */}
      <div className="game-container">
        <div className="game-area">
           <GameStateDisplay />
           <TetrisCanvas />
        </div>
        <div className="ui-panel">
          <h1>TetrAxis</h1> {/* New Title */}
          <ScoreDisplay />
          <LevelDisplay />
          <NextPiecePreview /> {/* Add the preview component */}
          <Controls />
          <ControlsReference /> {/* Add the controls reference */}
        </div>
      </div>
    </div>
  );
}

export default App;