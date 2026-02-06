/**
 * 3D Manager
 * 
 * Manages Three.js scene, camera, renderer, and rendering loop.
 * Uses WebGL renderer for hardware-accelerated 3D rendering.
 */

// Import Three.js with WebGL support
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { createCube, updateCubeFaceTexture } from '../objects/cube.js';
import { defaultCameraConfig } from '../objects/camera.js';

// Face index mapping (Three.js BoxGeometry uses different order)
export const faceIndexMap = { front: 4, back: 5, right: 0, left: 1, top: 2, bottom: 3 };

/**
 * 3D Manager class for handling Three.js initialization and rendering
 */
export class ThreeManager {
    constructor(options = {}) {
        // Three.js core objects
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        
        // Cube mesh
        this.cube = null;
        
        // Textures for each face
        this.textures = [null, null, null, null, null, null];
        
        // Camera state
        this.cameraObj = null;
        
        // Canvas element
        this.canvas = options.canvas || null;
        
        // Container element
        this.container = options.container || null;
        
        // State
        this.isInitialized = false;
        this.needsTextureUpdate = false;
        this.isAnimating = false;
        
        // On-demand rendering flags
        this.needsRender = true;
        this.renderScheduled = false;
        
        // Callbacks
        this.onRender = options.onRender || null;
        this.onCameraChange = options.onCameraChange || null;
    }

    /**
     * Initialize Three.js with WebGL renderer
     */
    async init() {
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        // Check WebGL support
        if (!WebGL.isWebGL2Available()) {
            throw new Error('WebGL is not supported by your browser');
        }

        // Disable color management
        THREE.ColorManagement.enabled = false;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // Fix texture color
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.toneMappingExposure = 2.8;
        
        console.log('Three.js WebGL renderer initialized');
    }

    /**
     * Initialize camera
     */
    initCamera() {
        const width = this.container ? this.container.clientWidth : 800;
        const height = this.container ? this.container.clientHeight : 600;
        
        // Create Three.js camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(5, 2, 5);
        
        // Create camera controls object for state tracking
        this.cameraObj = {
            ...defaultCameraConfig,
            updateFromThreeCamera: () => {
                const x = this.camera.position.x;
                const y = this.camera.position.y;
                const z = this.camera.position.z;
                this.cameraObj.radius = Math.sqrt(x * x + y * y + z * z);
                this.cameraObj.theta = Math.atan2(z, x);
                this.cameraObj.phi = Math.acos(y / this.cameraObj.radius);
                
                // Notify camera change
                if (this.onCameraChange) {
                    this.onCameraChange(this.cameraObj);
                }
            }
        };
        
        // Create OrbitControls
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.minDistance = this.cameraObj.minRadius;
        this.controls.maxDistance = this.cameraObj.maxRadius;
        this.controls.target.set(0, 0, 0);
        
        // Listen for control changes
        this.controls.addEventListener('change', () => {
            this.cameraObj.updateFromThreeCamera();
            this.startAnimationLoop();
            this.requestRender();
        });
        
        console.log('Camera initialized with OrbitControls');
    }

    /**
     * Initialize cube
     */
    initCube() {
        const cubeResult = createCube(this.scene);
        this.cube = cubeResult.mesh;
        console.log('Cube initialized');
    }

    /**
     * Update textures when images are loaded
     */
    updateTextures(imageManager, faceIndexMap) {
        if (!this.cube) return;

        const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        
        for (const face of faceNames) {
            const imageBitmap = imageManager.getImageBitmap(face);
            const faceIndex = faceIndexMap[face];
            
            if (imageBitmap) {
                const texture = new THREE.CanvasTexture(imageBitmap);
                texture.colorSpace = THREE.LinearSRGBColorSpace;
                
                updateCubeFaceTexture(this.cube, faceIndex, texture);
                this.textures[faceIndex] = texture;
            }
        }
        
        this.needsTextureUpdate = false;
    }

    /**
     * Request a render on the next animation frame
     */
    requestRender() {
        // Always set the flags
        this.needsRender = true;
        
        // Start the animation loop if it's not running
        if (!this.isAnimating) {
            this.startAnimationLoop();
            return;
        }
        
        // If already animating, just schedule a render
        if (this.renderScheduled) return;
        
        this.renderScheduled = true;
        
        requestAnimationFrame(() => {
            this.renderScheduled = false;
            if (this.needsRender) {
                this.renderFrame();
                this.needsRender = false;
            }
        });
    }

    /**
     * Render a single frame
     */
    renderFrame() {
        if (!this.renderer || !this.scene || !this.camera) return;
        
        // Update controls (damping)
        this.controls.update();
        
        // Check if we need texture update
        if (this.needsTextureUpdate && this.imageManager) {
            this.updateTextures(this.imageManager, this.faceIndexMap);
            // Continue to render the scene after texture update
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Notify external render callback
        if (this.onRender) {
            this.onRender();
        }
    }

    /**
     * Start animation loop for auto-rotate or damping
     */
    startAnimationLoop() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        let prevPosition = this.camera.position.clone();
        let stationaryFrames = 0;
        const stationaryThreshold = 10;
        
        const animate = () => {
            if (!this.isAnimating) return;
            
            this.controls.update();
            
            const isMoving = this.controls.enableDamping && 
                             this.camera.position.distanceTo(prevPosition) > 0.0001;
            
            prevPosition = this.camera.position.clone();
            
            if (isMoving) {
                stationaryFrames = 0;
            } else {
                stationaryFrames++;
            }
            
            if (isMoving || this.needsRender) {
                this.renderFrame();
                this.needsRender = false;
            }
            
            if (stationaryFrames >= stationaryThreshold) {
                this.stopAnimationLoop();
                return;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    /**
     * Stop animation loop
     */
    stopAnimationLoop() {
        this.isAnimating = false;
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.canvas || !this.camera || !this.renderer) return;
        if (!this.container) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        console.log(`Canvas resized to ${width}x${height}`);
    }

    /**
     * Get camera state
     */
    getCameraState() {
        return this.cameraObj;
    }

    /**
     * Set camera state
     */
    setCameraState(state) {
        if (this.cameraObj && this.controls) {
            if (state.radius !== undefined) this.cameraObj.radius = state.radius;
            if (state.theta !== undefined) this.cameraObj.theta = state.theta;
            if (state.phi !== undefined) this.cameraObj.phi = state.phi;
            
            // Update camera position
            const x = this.cameraObj.radius * Math.sin(this.cameraObj.phi) * Math.cos(this.cameraObj.theta);
            const y = this.cameraObj.radius * Math.cos(this.cameraObj.phi);
            const z = this.cameraObj.radius * Math.sin(this.cameraObj.phi) * Math.sin(this.cameraObj.theta);
            this.camera.position.set(x, y, z);
            
            this.controls.update();
            this.requestRender();
        }
    }

    /**
     * Reset camera to default position
     */
    resetCamera() {
        if (this.cameraObj && this.camera && this.controls) {
            this.cameraObj.radius = defaultCameraConfig.radius;
            this.cameraObj.theta = defaultCameraConfig.theta;
            this.cameraObj.phi = defaultCameraConfig.phi;
            
            const x = defaultCameraConfig.radius * Math.sin(defaultCameraConfig.phi) * Math.cos(defaultCameraConfig.theta);
            const y = defaultCameraConfig.radius * Math.cos(defaultCameraConfig.phi);
            const z = defaultCameraConfig.radius * Math.sin(defaultCameraConfig.phi) * Math.sin(defaultCameraConfig.theta);
            
            this.camera.position.set(x, y, z);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            this.requestRender();
        }
    }
}

/**
 * Create a ThreeManager instance
 * @param {Object} options - Configuration options
 * @returns {ThreeManager} ThreeManager instance
 */
export function createThreeManager(options = {}) {
    return new ThreeManager(options);
}
