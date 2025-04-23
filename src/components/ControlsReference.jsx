import React from 'react';
import RotatingCube from './RotatingCube'; // Import the cube component
import './ControlsReference.css';

const ControlsReference = () => {
  return (
    <div className="controls-reference info-display">
      <h2>Controls</h2>
      <ul>
        <li><strong>Arrows/WASD:</strong> Move Piece</li>
        <li><strong>Q/E:</strong> Rotate Y <RotatingCube axis="y" /></li>
        <li><strong>R:</strong> Rotate X <RotatingCube axis="x" /></li>
        <li><strong>F:</strong> Rotate Z <RotatingCube axis="z" /></li>
        <li><strong>Space:</strong> Drop Down</li> {/* Changed from Hard Drop for clarity */}
        <li><strong>P:</strong> Pause/Resume</li>
        <li><strong>Enter:</strong> Start/Restart</li>
        <li><strong>Mouse Wheel:</strong> Zoom View</li>
        <li><strong>Middle Mouse + Drag:</strong> Rotate View</li>
      </ul>
      {/* Rotating cubes implemented */}
    </div>
  );
};

export default ControlsReference;