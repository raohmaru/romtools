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

import { createCube, updateCubeFaceTexture, FACE_INDEX_MAP } from '../objects/cube.js';
import { defaultCameraConfig, getCameraPosition } from '../objects/camera.js';

/**
 * 3D Manager class for handling Three.js initialization and rendering
 */
export class ThreeManager {
    constructor(options = {}) {
        // Three.js core objects
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.orbitControls = null;
        this.transformControls = null;

        // Cube mesh
        this.cube = null;

        // Camera state
        this.cameraProps = null;

        // Canvas element
        this.canvas = options.canvas || null;
        this.canvasBBRect = null;

        // Container element
        this.container = options.container || null;

        // State
        this.needsTextureUpdate = [];
        this.isAnimating = false;

        // On-demand rendering flags
        this.needsRender = true;
        this.renderScheduled = false;

        // Callbacks
        this.onRender = options.onRender || null;
        this.onCameraChange = options.onCameraChange || null;

        // Raycaster for hover detection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.textureManager = options.textureManager;
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
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // Fix texture color
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        // this.renderer.toneMapping = THREE.LinearToneMapping;
        // this.renderer.toneMappingExposure = 1.1;

        // Canvas bounding box user space
        this.canvasBBRect = this.canvas.getBoundingClientRect();

        console.log('Three.js WebGL renderer initialized');
    }

    /**
     * Initialize camera
     */
    initCamera() {
        const width = this.container ? this.container.clientWidth : 800;
        const height = this.container ? this.container.clientHeight : 600;
        const cameraPos = getCameraPosition(defaultCameraConfig);

        // Create Three.js camera
        this.camera = new THREE.PerspectiveCamera(defaultCameraConfig.fov, width / height, 0.1, 100);
        this.camera.position.set(...cameraPos);

        // Create camera controls object for state tracking
        this.cameraProps = {
            ...defaultCameraConfig,
            updateFromThreeCamera: () => {
                const x = this.camera.position.x;
                const y = this.camera.position.y;
                const z = this.camera.position.z;
                this.cameraProps.radius = Math.sqrt(x * x + y * y + z * z);
                this.cameraProps.theta = Math.atan2(z, x);
                this.cameraProps.phi = Math.acos(y / this.cameraProps.radius);
                this.cameraProps.fov = this.camera.getFocalLength();
                // Euler rotation without the last item (order)
                this.cameraProps.rotation = this.cube.rotation.toArray().slice(0, -1);

                // Notify camera change
                if (this.onCameraChange) {
                    this.onCameraChange(this.cameraProps);
                }
            }
        };

        console.log('Camera initialized with OrbitControls');
    }

    /**
     * Create OrbitControls
     */
    initOrbitControls() {
        this.orbitControls = new OrbitControls(this.camera, this.canvas);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.1;
        this.orbitControls.minDistance = this.cameraProps.minRadius;
        this.orbitControls.maxDistance = this.cameraProps.maxRadius;
        this.orbitControls.target.set(0, 0, 0);

        // Listen for control changes
        this.orbitControls.addEventListener('change', () => {
            this.cameraProps.updateFromThreeCamera();
            this.startAnimationLoop();
            this.requestRender();
        });
    }

    /**
     * Initialize TransformControls for cube manipulation
     */
    async initTransformControls() {
        const { TransformControls } = await import('three/addons/controls/TransformControls.js');

        this.transformControls = new TransformControls(this.camera, this.canvas);
        this.transformControls.attach(this.cube);
        this.transformControls.setMode('rotate');
        this.transformControls.setSpace('local');
        this.scene.add(this.transformControls.getHelper());

        this.transformControls.addEventListener('change', (event) => {
            this.requestRender();
            this.cameraProps.updateFromThreeCamera();
        });
        // Disable OrbitControls when TransformControls is dragging
        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.orbitControls.enabled = !event.value;
        });

        console.log('TransformControls initialized with rotation mode');
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
    updateTextures() {
        if (!this.cube) {
            return;
        }

        for (let i = 0; i < this.needsTextureUpdate.length; i++) {
            const face = this.needsTextureUpdate[i];
            const imageBitmap = this.textureManager.getImageBitmap(face);
            const faceIndex = FACE_INDEX_MAP[face];

            if (imageBitmap) {
                const texture = new THREE.CanvasTexture(imageBitmap);
                texture.colorSpace = THREE.LinearSRGBColorSpace;

                updateCubeFaceTexture(this.cube, faceIndex, texture);
            }
        }

        this.needsTextureUpdate = [];
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

        // If already scheduled, no need to schedule another render
        if (this.renderScheduled) {
            return;
        }

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
        if (!this.renderer || !this.scene || !this.camera) {
            return;
        }

        // Update controls (damping)
        this.orbitControls.update();

        // Check if we need texture update
        if (this.needsTextureUpdate && this.textureManager) {
            this.updateTextures(this.textureManager, FACE_INDEX_MAP);
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
     * Start animation loop for damping
     */
    startAnimationLoop() {
        if (this.isAnimating) {
            return;
        }

        this.isAnimating = true;

        let prevPosition = this.camera.position.clone();
        let stationaryFrames = 0;
        const stationaryThreshold = 10;

        const animate = () => {
            if (!this.isAnimating) {
                return;
            }

            this.orbitControls.update();

            // Camera is stationary if it hasn't moved significantly for a few frames
            const isMoving = this.orbitControls.enableDamping &&
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

        // Update canvas bounding box for performance optimization
        this.canvasBBRect = this.canvas.getBoundingClientRect();

        console.log(`Canvas resized to ${width}x${height}`);
    }
    
    /**
     * Set camera state
     */
    setCameraState(state) {
        if (this.cameraProps && this.orbitControls) {
            if (state.radius !== undefined) this.cameraProps.radius = state.radius;
            if (state.theta !== undefined) this.cameraProps.theta = state.theta;
            if (state.phi !== undefined) this.cameraProps.phi = state.phi;

            // Update camera position
            const x = this.cameraProps.radius * Math.sin(this.cameraProps.phi) * Math.cos(this.cameraProps.theta);
            const y = this.cameraProps.radius * Math.cos(this.cameraProps.phi);
            const z = this.cameraProps.radius * Math.sin(this.cameraProps.phi) * Math.sin(this.cameraProps.theta);
            this.camera.position.set(x, y, z);

            this.orbitControls.update();
            this.requestRender();
        }
    }

    /**
     * Reset camera to default position
     */
    reset() {
        if (this.cameraProps && this.camera && this.orbitControls) {
            this.cameraProps.radius = defaultCameraConfig.radius;
            this.cameraProps.theta = defaultCameraConfig.theta;
            this.cameraProps.phi = defaultCameraConfig.phi;

            const x = defaultCameraConfig.radius * Math.sin(defaultCameraConfig.phi) * Math.cos(defaultCameraConfig.theta);
            const y = defaultCameraConfig.radius * Math.cos(defaultCameraConfig.phi);
            const z = defaultCameraConfig.radius * Math.sin(defaultCameraConfig.phi) * Math.sin(defaultCameraConfig.theta);

            this.camera.position.set(x, y, z);
            this.orbitControls.target.set(0, 0, 0);
            this.orbitControls.update();
            this.requestRender();
        }
    }

    /**
     * Get geometry's bounding box (local space)
     * @param {THREE.Mesh} mesh
     * @param {THREE.PerspectiveCamera} camera 
     * @param {HTMLCanvasElement} canvas 
     * @returns {Object} Bounding box object with dimensions in pixels
     */
    getScreenSpaceBoundingBox(mesh) {
        if (!mesh.geometry.boundingBox) {
            mesh.geometry.computeBoundingBox();
        }
        const box = mesh.geometry.boundingBox.clone();

        // Transform to world space using object's world matrix
        const worldBox = box.clone().applyMatrix4(mesh.matrixWorld);

        // Project all 8 corners through the camera
        const { x: minX, y: minY, z: minZ } = worldBox.min;
        const { x: maxX, y: maxY, z: maxZ } = worldBox.max;
        const corners = [
            new THREE.Vector3(minX, minY, minZ),
            new THREE.Vector3(minX, minY, maxZ),
            new THREE.Vector3(minX, maxY, minZ),
            new THREE.Vector3(minX, maxY, maxZ),
            new THREE.Vector3(maxX, minY, minZ),
            new THREE.Vector3(maxX, minY, maxZ),
            new THREE.Vector3(maxX, maxY, minZ),
            new THREE.Vector3(maxX, maxY, maxZ)
        ];

        const screenBox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
        const { clientWidth, clientHeight } = this.canvas;

        for (const corner of corners) {
            corner.project(this.camera);

            // Convert from normalized device coordinates (-1 to +1) to screen pixels
            const x = (corner.x * 0.5 + 0.5) * clientWidth;
            const y = (-corner.y * 0.5 + 0.5) * clientHeight;

            screenBox.minX = Math.min(screenBox.minX, x);
            screenBox.minY = Math.min(screenBox.minY, y);
            screenBox.maxX = Math.max(screenBox.maxX, x);
            screenBox.maxY = Math.max(screenBox.maxY, y);
        }

        const bbox = {
            x: Math.floor(screenBox.minX),
            y: Math.floor(screenBox.minY),
            width: Math.ceil(screenBox.maxX - screenBox.minX),
            height: Math.ceil(screenBox.maxY - screenBox.minY)
        };

        return bbox;
    }

    /**
     * Returns the face that intersect at the given userspace coordinates
     * @param {number} x 
     * @param {number} y 
     * @returns {number} Face index
     */
    getFaceAt(x, y) {
        if (!this.cube) {
            return;
        }

        this.mouse.x = ((x - this.canvasBBRect.left) / this.canvasBBRect.width) * 2 - 1;
        this.mouse.y = -((y - this.canvasBBRect.top) / this.canvasBBRect.height) * 2 + 1;

        // Cast ray from camera through mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.cube);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            // Each face is composed of two triangles
            return Math.floor(intersect.faceIndex / 2);
        }

        return -1;
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
