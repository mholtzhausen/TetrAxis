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

  return (
    <mesh ref={meshRef} scale={[0.8, 0.8, 0.8]} > {/* Slightly smaller cube */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" wireframe={true} /> {/* Wireframe for clarity */}
    </mesh>
  );
};

const RotatingCube = ({ axis }) => {
  return (
    <Canvas style={{ width: '25px', height: '25px', display: 'inline-block', verticalAlign: 'middle', marginLeft: '5px' }}
            camera={{ position: [0, 0, 2.5], fov: 50 }} // Adjust camera for small canvas
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