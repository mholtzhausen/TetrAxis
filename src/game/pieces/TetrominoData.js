// src/game/pieces/TetrominoData.js
import * as THREE from 'three';

// Define standard colors for each piece type
export const COLORS = {
  I: new THREE.Color(0x00FFFF), // Cyan
  O: new THREE.Color(0xFFFF00), // Yellow
  T: new THREE.Color(0x800080), // Purple
  S: new THREE.Color(0x00FF00), // Green
  Z: new THREE.Color(0xFF0000), // Red
  J: new THREE.Color(0x0000FF), // Blue
  L: new THREE.Color(0xFFA500), // Orange
};

// Define the shapes as relative block coordinates [x, y, z] from a pivot point.
// The pivot is generally the conceptual center of rotation.
// Y is typically the 'up' direction in Tetris.
// We define the initial orientation (rotation state 0).
export const SHAPES = {
  // I piece (Line): Pivot is between the 2nd and 3rd block
  I: [
    new THREE.Vector3(0, 2, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0), // Pivot assumed here for simplicity, adjust if needed
    new THREE.Vector3(0, -1, 0),
  ],
  // O piece (Square): Pivot is the center of the 2x2 square
  O: [
    new THREE.Vector3(0, 0, 0), // Pivot
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 1, 0),
  ],
  // T piece: Pivot is the center block of the horizontal bar
  T: [
    new THREE.Vector3(0, 0, 0), // Pivot
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0), // Block above pivot
  ],
  // S piece: Pivot is the center point between the two middle blocks
  S: [
    new THREE.Vector3(0, 0, 0), // Pivot
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(-1, 1, 0),
  ],
  // Z piece: Pivot is the center point between the two middle blocks
  Z: [
    new THREE.Vector3(0, 0, 0), // Pivot
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 1, 0),
  ],
  // J piece: Pivot is the center of the 3-block vertical segment
  J: [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0), // Pivot
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(-1, -1, 0), // Hook block
  ],
  // L piece: Pivot is the center of the 3-block vertical segment
  L: [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0), // Pivot
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(1, -1, 0), // Hook block
  ],
};

// Function to get a random tetromino type
export const getRandomTetrominoType = () => {
  const types = Object.keys(SHAPES);
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
};