// src/rendering/TetrisCanvas.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Import OrbitControls
import useGameStore from '../state/gameStore'; // Import the store hook
import useInputHandler from '../hooks/useInputHandler'; // Import input handler hook
import useGameLoop from '../hooks/useGameLoop'; // Import game loop hook
import { COLORS } from '../game/pieces/TetrominoData'; // Import colors for blocks

// --- Constants ---
const BLOCK_SIZE = 1; // Size of each cube
// Create geometry once and reuse
export const BLOCK_GEOMETRY = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); // Export
// Create materials once and reuse
export const BLOCK_MATERIALS = Object.keys(COLORS).reduce((acc, key) => { // Export
    // Using MeshLambertMaterial for lighting effects
    acc[key] = new THREE.MeshLambertMaterial({ color: COLORS[key] });
    return acc;
}, {});
// Material for settled blocks (using color from grid)
const SETTLED_MATERIAL = new THREE.MeshLambertMaterial({ vertexColors: false }); // Set to false to use instance color

const TetrisCanvas = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null); // Ref to store controls instance
  const animationFrameIdRef = useRef(null);
  const currentPieceMeshGroupRef = useRef(null); // Group for current piece blocks
  const settledBlocksMeshRef = useRef(null); // InstancedMesh for settled blocks

  // Subscribe to store state needed for rendering updates
  // Select individual state pieces to prevent unnecessary re-renders
  const currentPiece = useGameStore((state) => state.currentPiece);
  const grid = useGameStore((state) => state.grid);
  const gameState = useGameStore((state) => state.gameState);

  // Initialize game logic hooks - these run their effects internally
  useInputHandler();
  useGameLoop();

  // Effect for Three.js setup (runs once on mount)
  useEffect(() => {
    // --- Core Three.js Setup ---
    const currentMount = mountRef.current;
    // Check if already initialized or mount point not ready
    if (!currentMount || rendererRef.current) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Set background to white
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      55, // Slightly wider FOV
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    // Get initial grid dimensions directly from the store state inside the effect
    const initialGrid = useGameStore.getState().grid;
    const { width: gridWidth, height: gridHeight, depth: gridDepth } = initialGrid;
    const gridCenterX = gridWidth / 2;
    const gridCenterY = gridHeight / 2;
    const gridCenterZ = gridDepth / 2;

    // Adjust camera position and target - Higher and further back
    camera.position.set(gridCenterX, gridCenterY * 1.5, gridCenterZ * 4.0); // e.g., (5, 15, 40)
    // Look towards the middle-ish part of the grid volume
    camera.lookAt(gridCenterX, gridCenterY * 0.8, gridCenterZ); // e.g., (5, 8, 5)
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // For sharper rendering on high DPI screens
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // 5. Grid Helper and Transparent Bounding Box
    // Grid Helper (Floor)
    const helperSize = Math.max(gridWidth, gridDepth); // Should be 10
    const gridHelper = new THREE.GridHelper(helperSize, helperSize); // Default grey color
    gridHelper.position.set(gridCenterX - BLOCK_SIZE / 2, -BLOCK_SIZE / 2, gridCenterZ - BLOCK_SIZE / 2); // Position (4.5, -0.5, 4.5)
    scene.add(gridHelper);

    // Bounding Box Outline (Edges)
    const boxGeometry = new THREE.BoxGeometry(gridWidth, gridHeight, gridDepth);
    const edges = new THREE.EdgesGeometry(boxGeometry); // Use EdgesGeometry for cleaner lines
    // Simplify material: Solid black, thin lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x000000, // Black color for max contrast
        // transparent: true, // Removed
        // opacity: 0.8, // Removed
        // linewidth: 2 // Removed
    });
    const boundingEdges = new THREE.LineSegments(edges, lineMaterial);
    boundingEdges.position.set(gridCenterX - BLOCK_SIZE / 2, gridCenterY - BLOCK_SIZE / 2, gridCenterZ - BLOCK_SIZE / 2); // Position (4.5, 9.5, 4.5)
    scene.add(boundingEdges);
    // scene.add(boxMesh);


    // 6. Setup Mesh Groups/Instanced Meshes
    currentPieceMeshGroupRef.current = new THREE.Group();
    scene.add(currentPieceMeshGroupRef.current);

    // Use InstancedMesh for potentially many settled blocks
    // Max count assumes a full grid
    const maxSettledBlocks = gridWidth * gridHeight * gridDepth;
    // Clone the material to avoid modifying the original shared one
    const instancedMaterial = SETTLED_MATERIAL.clone();
    settledBlocksMeshRef.current = new THREE.InstancedMesh(BLOCK_GEOMETRY, instancedMaterial, maxSettledBlocks);
    settledBlocksMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Optimize for updates

    // Setup instance color buffer attribute
    const colorArray = new Float32Array(maxSettledBlocks * 3);
    settledBlocksMeshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
    settledBlocksMeshRef.current.instanceColor.setUsage(THREE.DynamicDrawUsage);

    scene.add(settledBlocksMeshRef.current);


    // --- Orbit Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(gridCenterX, gridCenterY * 0.8, gridCenterZ); // Set target to where camera looks
    controls.enablePan = false; // Disable panning
    // controls.enableZoom = false; // Optional: Disable zooming
    controls.enableDamping = true; // Enable smooth damping
    controls.dampingFactor = 0.1;
    // Optional: Restrict vertical rotation
    // controls.minPolarAngle = Math.PI / 4; // Don't look from too low
    // controls.maxPolarAngle = Math.PI / 1.5; // Don't look from directly above
    controls.mouseButtons = { // Ensure middle mouse rotates
        LEFT: null, // Disable left mouse drag for rotation (if needed)
        MIDDLE: THREE.MOUSE.ROTATE,
        RIGHT: null // Disable right mouse drag (usually pan/zoom)
    };
    controlsRef.current = controls;


    // --- Render Loop ---
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate); // Request next frame first
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return; // Ensure refs are set

      // Update controls if damping is enabled
      controlsRef.current.update();

      // Update logic handled by hooks and Zustand

      // Render
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // --- Resize Handling ---
    const handleResize = () => {
      if (currentMount && rendererRef.current && cameraRef.current) {
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
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
      // Dispose Three.js objects
      sceneRef.current?.traverse(object => {
        // Dispose geometries and materials attached to objects in the scene
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      // Dispose shared geometry - uncomment if not reused elsewhere and causing issues
      // BLOCK_GEOMETRY.dispose();
      // Dispose shared materials
      Object.values(BLOCK_MATERIALS).forEach(mat => mat.dispose());
      // Dispose the material used by the InstancedMesh
      if (settledBlocksMeshRef.current?.material) {
          settledBlocksMeshRef.current.material.dispose();
      }
      rendererRef.current?.dispose();

      // Dispose controls
      controlsRef.current?.dispose();

      // Clear refs
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null; // Clear controls ref
      currentPieceMeshGroupRef.current = null;
      settledBlocksMeshRef.current = null;
    };
  }, []); // Empty dependency array: Run setup only once on mount

  // Effect for updating meshes based on game state
  useEffect(() => {
    const pieceGroup = currentPieceMeshGroupRef.current;
    const settledMesh = settledBlocksMeshRef.current;
    const scene = sceneRef.current;

    if (!pieceGroup || !settledMesh || !scene) return;
    console.log("[TetrisCanvas] Updating meshes. GameState:", gameState, "CurrentPiece:", !!currentPiece, "Grid updated:", grid); // Log state

    // --- Update Current Piece ---
    // Clear previous piece blocks efficiently
    while (pieceGroup.children.length > 0) {
      pieceGroup.remove(pieceGroup.children[0]);
    }

    // Add new blocks if piece exists and game is playing/paused
    if (currentPiece && (gameState === 'Playing' || gameState === 'Paused')) {
      const material = BLOCK_MATERIALS[currentPiece.type] || new THREE.MeshLambertMaterial({ color: currentPiece.color });
      const worldCoords = currentPiece.getWorldBlockCoordinates();
      console.log(`[TetrisCanvas] Current piece type: ${currentPiece.type}, Coords:`, worldCoords.map(c => `(${Math.round(c.x)},${Math.round(c.y)},${Math.round(c.z)})`).join(' '));

      worldCoords.forEach(coord => {
        const blockMesh = new THREE.Mesh(BLOCK_GEOMETRY, material);
        // Round coordinates to align with grid visually
        const pos = new THREE.Vector3(Math.round(coord.x), Math.round(coord.y), Math.round(coord.z));
        blockMesh.position.copy(pos);
        // console.log("[TetrisCanvas] Adding current piece block at:", pos); // Can be noisy
        pieceGroup.add(blockMesh);
      });
    } else {
       // console.log("[TetrisCanvas] No current piece to render.");
    }

    // --- Update Settled Blocks ---
    const matrix = new THREE.Matrix4();
    let instanceIndex = 0;
    const gridData = grid.cells; // Access the raw grid data
    const maxSettledBlocks = settledMesh.instanceMatrix.count; // Use the capacity of the InstancedMesh buffers

    for (let x = 0; x < grid.width; x++) {
      for (let y = 0; y < grid.height; y++) {
        for (let z = 0; z < grid.depth; z++) {
          const cellColor = gridData[x][y][z];
          if (cellColor !== null) { // If cell is occupied
            // Check instanceIndex against max capacity
            if (instanceIndex < maxSettledBlocks) {
               matrix.setPosition(x, y, z);
               settledMesh.setMatrixAt(instanceIndex, matrix);
               // Set color using the instanceColor buffer attribute
               const color = cellColor instanceof THREE.Color ? cellColor : new THREE.Color(0xaaaaaa); // Default grey if color invalid
               // Check if instanceColor exists before setting
               if (settledMesh.instanceColor) {
                   settledMesh.setColorAt(instanceIndex, color);
               }
               instanceIndex++;
            } else {
                console.warn("Grid contains more blocks than InstancedMesh capacity.");
                break; // Avoid errors
            }
          }
        }
        if(instanceIndex >= maxSettledBlocks) break;
      }
       if(instanceIndex >= maxSettledBlocks) break;
    }
    console.log("[TetrisCanvas] Settled blocks instance count:", instanceIndex);
    // Set the actual number of instances to render
    settledMesh.count = instanceIndex;
    // Mark buffers as needing update
    settledMesh.instanceMatrix.needsUpdate = true;
    if (settledMesh.instanceColor) {
        settledMesh.instanceColor.needsUpdate = true;
    }

  }, [currentPiece, grid, gameState]); // Re-run when these state parts change


  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', display: 'block' }} // Ensure div takes up space
    />
  );
};

export default TetrisCanvas;