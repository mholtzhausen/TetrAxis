import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Cube = ({ axis }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      const speed = 0.5; // Rotation speed
      switch (axis) {
        case 'x':
          meshRef.current.rotation.x += delta * speed;
          break;
        case 'y':
          meshRef.current.rotation.y += delta * speed;
          break;
        case 'z':
        default:
          meshRef.current.rotation.z += delta * speed;
          break;
      }
    }
  });

  // Define 6 materials with different opacities
  const materials = [
    new THREE.MeshStandardMaterial({ color: 'orange', opacity: 0.7, transparent: true }), // right
    new THREE.MeshStandardMaterial({ color: 'orange', opacity: 0.6, transparent: true }), // left
    new THREE.MeshStandardMaterial({ color: 'orange', opacity: 0.8, transparent: true }), // top
    new THREE.MeshStandardMaterial({ color: 'orange', opacity: 0.5, transparent: true }), // bottom
    new THREE.MeshStandardMaterial({ color: 'orange', opacity: 0.9, transparent: true }), // front
    new THREE.MeshStandardMaterial({ color: 'orange', opacity: 0.4, transparent: true })  // back
  ];

  return (
    <mesh ref={meshRef} scale={[0.8, 0.8, 0.8]} material={materials}> {/* Apply array of materials */}
      <boxGeometry args={[1, 1, 1]} />
      {/* Material is now assigned directly to the mesh */}
    </mesh>
  );
};

const RotatingCube = ({ axis }) => {
  const cubeSize = 38; // Increased size (25px * 1.5)
  return (
    <Canvas style={{ width: `${cubeSize}px`, height: `${cubeSize}px`, display: 'inline-block', verticalAlign: 'middle', marginLeft: '5px' }}
            camera={{ position: [0, 0, 2.8], fov: 50 }} // Pull camera back slightly for larger cube
            gl={{ alpha: true, antialias: true }} // Enable transparency and antialiasing
            frameloop="always" // Ensure continuous animation
            >
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <Cube axis={axis} />
    </Canvas>
  );
};

export default RotatingCube;