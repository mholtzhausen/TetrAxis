// src/components/NextPiecePreview.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import useGameStore from '../state/gameStore';
// Import shared constants - adjust path if needed
import { BLOCK_GEOMETRY, BLOCK_MATERIALS } from '../rendering/TetrisCanvas';

const NextPiecePreview = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const pieceGroupRef = useRef(null); // Group for the preview piece blocks

  // Subscribe only to the nextPiece state
  const nextPiece = useGameStore((state) => state.nextPiece);

  // Effect for Three.js setup
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || rendererRef.current) return; // Prevent re-initialization

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = null; // Set background to null for transparency
    sceneRef.current = scene;

    // 2. Camera (Orthographic might be better for consistent size)
    const aspect = currentMount.clientWidth / currentMount.clientHeight;
    const viewSize = 5; // Adjust this to fit pieces nicely
    const camera = new THREE.OrthographicCamera(
        -viewSize * aspect / 2, viewSize * aspect / 2,
        viewSize / 2, -viewSize / 2,
        0.1, 100
    );
    camera.position.set(0, 0, 10); // Positioned to look along Z-axis
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Alpha for potential transparency
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 2, 1.5);
    scene.add(directionalLight);

    // 5. Piece Group
    pieceGroupRef.current = new THREE.Group();
    scene.add(pieceGroupRef.current);

    // --- Render Loop ---
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !pieceGroupRef.current) return;

      // Optional: Add slow rotation for visual appeal
      pieceGroupRef.current.rotation.y += 0.005;
      pieceGroupRef.current.rotation.x += 0.003;


      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // --- Resize Handling ---
    const handleResize = () => {
      if (currentMount && rendererRef.current && cameraRef.current) {
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        rendererRef.current.setSize(width, height);

        // Update orthographic camera projection
        const newAspect = width / height;
        cameraRef.current.left = -viewSize * newAspect / 2;
        cameraRef.current.right = viewSize * newAspect / 2;
        cameraRef.current.top = viewSize / 2;
        cameraRef.current.bottom = -viewSize / 2;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (rendererRef.current && currentMount && rendererRef.current.domElement.parentNode === currentMount) {
         currentMount.removeChild(rendererRef.current.domElement);
      }
      // Dispose scene objects (important if component unmounts/remounts)
      sceneRef.current?.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      rendererRef.current?.dispose();
      // Clear refs
      rendererRef.current = null; sceneRef.current = null; cameraRef.current = null; pieceGroupRef.current = null;
    };
  }, []); // Empty dependency array ensures setup runs only once

  // Effect for updating the preview piece when `nextPiece` changes
  useEffect(() => {
    const pieceGroup = pieceGroupRef.current;
    if (!pieceGroup || !nextPiece) {
        // Clear group if no next piece
        if(pieceGroup) {
            while (pieceGroup.children.length > 0) {
                pieceGroup.remove(pieceGroup.children[0]);
            }
        }
        return;
    };

    // Clear previous piece blocks
    while (pieceGroup.children.length > 0) {
      pieceGroup.remove(pieceGroup.children[0]);
    }

    // Get material (reuse from TetrisCanvas imports)
    const material = BLOCK_MATERIALS[nextPiece.type] || new THREE.MeshLambertMaterial({ color: nextPiece.color });

    // Use baseShape for preview - no rotation needed from game state
    // Calculate bounds to center the piece
    const boundingBox = new THREE.Box3();
    nextPiece.baseShape.forEach(relativePos => {
        boundingBox.expandByPoint(relativePos);
    });
    const centerOffset = new THREE.Vector3();
    boundingBox.getCenter(centerOffset);

    // Add new blocks, adjusting position to center them
    nextPiece.baseShape.forEach(relativePos => {
      const blockMesh = new THREE.Mesh(BLOCK_GEOMETRY, material);
      // Apply centering offset
      blockMesh.position.copy(relativePos).sub(centerOffset);
      pieceGroup.add(blockMesh);
    });

     // Reset group rotation when piece changes
     pieceGroup.rotation.set(0, 0, 0);


  }, [nextPiece]); // Re-run only when nextPiece changes

  return (
    <div className="next-piece-preview">
      <h4>Next</h4>
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100px', display: 'block' }} // Adjust size as needed
      />
    </div>
  );
};

export default NextPiecePreview;
