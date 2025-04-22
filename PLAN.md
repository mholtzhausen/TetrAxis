# Project Plan: WebGL 3D Tetris

## 1. Core Technologies

- **Rendering Engine:** Three.js (preferred) on HTML5 Canvas.
- **UI Framework:** React.
- **Core Logic:** Modern JavaScript (ES6+).

## 2. Architecture

- **Modularity:** Separate directories for `components`, `game`, `rendering`, `hooks`, `state`, `utils`.
- **Key Components:**
  - `GameController`: Main loop, orchestration.
  - `Renderer`: Three.js setup, render loop.
  - `SceneManager`: Manages 3D objects in the scene.
  - `Piece`/`Tetrominoes`: Piece definitions, rotation logic.
  - `Grid`: Represents the 3D playfield state.
  - `InputHandler`: Captures and translates user input.
  - `UIManager`: React components for UI display.
  - `TetrisCanvas.jsx`: React component hosting the Three.js canvas.
- **Architectural Flow Diagram:**

  ```mermaid
  graph TD
      subgraph Browser
          UI[React UI Components]
          Canvas[HTML5 Canvas]
      end

      subgraph Application Core
          GameController[GameController / Main Loop]
          State[Zustand Store]
          InputHandler[Input Handler]
          Logic[Game Logic (Grid, Pieces, Collision, Scoring)]
          Renderer[Three.js Renderer]
      end

      UI -- Reads/Updates --> State
      InputHandler -- User Input --> GameController
      GameController -- Updates --> Logic
      GameController -- Triggers Render --> Renderer
      Logic -- Updates --> State
      Renderer -- Reads --> State
      Renderer -- Renders To --> Canvas
      State -- Notifies --> UI
  ```

## 3. State Management

- **Library:** Zustand.
- **Store Structure:** Centralized store holding `grid`, `currentPiece`, `nextPiece`, `score`, `level`, `linesCleared`, `gameState`, and associated actions.

## 4. Data Structures

- **Grid:** 3D array (`grid[x][y][z]`) storing `null` or piece identifiers/colors for settled blocks.
- **Pieces:** Defined by base relative block coordinates from a pivot. Instances store type, color, world position, rotation state, and current relative block coordinates.

## 5. Next Steps

Proceed with iterative implementation based on specific requests (e.g., boilerplate, class structures, algorithms) using `code` mode.
