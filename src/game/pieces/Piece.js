// src/game/pieces/Piece.js
import * as THREE from 'three';
import { SHAPES, COLORS } from './TetrominoData.js';

// Define rotation axes
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);
const ROTATION_ANGLE = Math.PI / 2; // 90 degrees

class Piece {
  constructor(type, gridStartPosition = new THREE.Vector3(5, 18, 5)) {
    if (!SHAPES[type] || !COLORS[type]) {
      throw new Error(`Invalid piece type: ${type}`);
    }

    this.type = type;
    this.color = COLORS[type];
    this.position = gridStartPosition.clone(); // World position of the pivot point

    // Store the base shape (relative coordinates)
    this.baseShape = SHAPES[type].map(v => v.clone());

    // Current rotated relative block coordinates
    this.blocks = this.baseShape.map(v => v.clone());

    // Rotation state (using Quaternion for robust 3D rotation)
    this.rotation = new THREE.Quaternion();
  }

  /**
   * Applies a rotation quaternion to the piece's blocks.
   * @param {THREE.Quaternion} quaternion - The rotation to apply.
   */
  _applyRotation(quaternion) {
    this.rotation.premultiply(quaternion); // Combine rotations

    // Apply the total rotation to the base shape to get current block positions
    this.blocks = this.baseShape.map(baseVector => {
      const rotatedVector = baseVector.clone();
      rotatedVector.applyQuaternion(this.rotation);
      // Round to nearest integer to keep blocks aligned with grid
      rotatedVector.round();
      return rotatedVector;
    });
  }

  /**
   * Rotates the piece 90 degrees around the specified axis (X, Y, or Z).
   * @param {THREE.Vector3} axis - The axis of rotation (AXIS_X, AXIS_Y, AXIS_Z).
   */
  rotate(axis) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, ROTATION_ANGLE);
    this._applyRotation(quaternion);
  }

  rotateX() {
    this.rotate(AXIS_X);
  }

  rotateY() {
    this.rotate(AXIS_Y);
  }

  rotateZ() {
    this.rotate(AXIS_Z);
  }

  /**
   * Moves the piece by the given offset.
   * @param {THREE.Vector3} offset - The amount to move in x, y, z.
   */
  move(offset) {
    this.position.add(offset);
  }

  /**
   * Calculates the world coordinates of each block of the piece.
   * @returns {THREE.Vector3[]} An array of world coordinates for each block.
   */
  getWorldBlockCoordinates() {
    return this.blocks.map(relativePos => {
      return relativePos.clone().add(this.position);
    });
  }

  /**
   * Creates a clone of the piece (useful for collision checking).
   * @returns {Piece} A new Piece instance with the same state.
   */
  clone() {
    const clonedPiece = new Piece(this.type, this.position);
    clonedPiece.rotation.copy(this.rotation);
    clonedPiece.blocks = this.blocks.map(v => v.clone());
    return clonedPiece;
  }
}

export default Piece;