/**
 * Cover 3D - Main Application Entry Point
 * 
 * Uses Three.js for 3D box cover visualization.
 * Implements on-demand rendering for improved performance.
 */
import { createThreeManager } from './managers/3dManager.js';
import { createTextureManager, initializeFileInputs, initializeColorInputs, updatePreview } from './managers/textureManager.js';
import { createConfigManagerUI } from './managers/configManager.js';
import { createScreenshotManager } from './managers/screenshotManager.js';
import { createGUIManager } from './managers/guiManager.js';
import { Zoom } from './components/zoom.js';
import { Loading } from './components/loading.js';
import { Message } from './components/message.js';
import { KeyboardShortcuts, KEYBOARD_SHORTCUTS } from './components/keyboardShortcuts.js';
import { debounce } from './utils/debounce.js';
import { setCubeDimensions, updateCubeFaceColor, highlightCubeFace, getCubeFaceName, FACE_INDEX_MAP } from './objects/cube.js';
import { defaultCameraConfig } from './objects/camera.js';
import { $ } from 'rtkjs/dom.js';


/**
 * Main application class that coordinates all modules.
 */
export class Cover3DApplication {
    constructor() {
        // Three.js manager
        this.threeManager = null;

        // Managers
        this.threeManager = null;
        this.textureManager = null;
        this.configManager = null;
        this.screenshotManager = null;
        this.GUIManager = null;

        // UI elements
        this.zoom = null;
        this.loading = null;
        this.message = null;
        this.keyboardShortcuts = null;
    }

    /**
     * Initialize the entire application.
     */
    async init() {
        try {
            // Initialize UI components
            this.loading = new Loading();
            this.loading.show();
            this.message = new Message(document.body);
            this.message.info('Initializing Cover 3D...');

            // Get canvas and container
            const canvas = $('#webgl-canvas');
            const container = $('#canvas-container');

            if (!canvas) {
                throw new Error('Canvas element not found');
            }

            // Initialize managers
            await this.initManagers(canvas, container);

            // Create zoom indicator
            this.zoom = new Zoom(container, {
                minRadius: this.threeManager.cameraProps.minRadius,
                maxRadius: this.threeManager.cameraProps.maxRadius
            });
            this.zoom.update(this.threeManager.cameraProps);

            // Setup event listeners
            this.setupEventListeners();

            // Initial resize and render
            this.threeManager.handleResize();
            this.threeManager.requestRender();

            this.message.success('Cover 3D ready! Press [?] for keyboard shortcuts.');
            this.loading.hide();

            console.log('Cover 3D initialized successfully with Three.js WebGL');

        } catch (error) {
            console.error('Failed to initialize Cover 3D:', error);
            this.message?.error(`Initialization failed: ${error.message}`);
            this.loading?.hide();
            this.showWebGLError();
            throw error;
        }
    }

    /**
     * Initialize all manager modules.
     * @param {HTMLCanvasElement} canvas 
     * @param {HTMLElement} container 
     */
    async initManagers(canvas, container) {
        // Image manager
        this.textureManager = createTextureManager();

        // Initialize Three.js manager
        this.threeManager = createThreeManager({
            canvas,
            container,
            textureManager: this.textureManager,
            onCameraChange: (cameraState) => {
                if (this.zoom) {
                    this.zoom.update(cameraState);
                }
            }
        });

        try {
            await this.threeManager.init();
        } catch (err) {
            throw new Error('WebGL is not supported by your browser');
        }
        this.threeManager.initCamera();
        this.threeManager.initCube();
        this.threeManager.initOrbitControls();

        // Config manager with UI integration
        this.configManager = createConfigManagerUI({
            onSave: (result) => {
                this.message?.success(`Configuration saved: ${result.filename}`);
            },
            onLoad: (result) => {
                if (result.success) {
                    this.message?.success(result.message);
                    this.threeManager.requestRender();
                    if (this.GUIManager) {
                        this.GUIManager.update({ fov: this.threeManager.cameraProps.fov });
                    }
                } else {
                    this.message?.error(`Failed to load configuration.\n${result.error}`);
                }
            },
            onViewChange: (result) => {
                if (result.success) {
                    this.message?.success(result.message);
                    this.threeManager.requestRender();
                } else {
                    this.message?.error('Failed to load configuration.');
                }
            },
            onBoxChange: (box) => {
                this.message?.success(`Game box preset: ${box.name}`);
                // Reset custom scaling
                this.threeManager.cube.scale.fromArray([1, 1, 1]);
                setCubeDimensions(this.threeManager.cube, box.config);
                this.threeManager.cube.name = box.name;
                this.threeManager.requestRender();
            },
            onError: (error) => {
                this.message?.error(`Error: ${error.message}`);
            },
            onProgress: (message) => {
                if (message) {
                    this.message?.info(message);
                }
            }
        });

        // Screenshot manager
        this.screenshotManager = createScreenshotManager();

        console.log('Managers initialized');
    }

    /**
     * Initialize the GUI manager for advanced options.
     */
    async initGUIManager() {
        this.loading.show();
        this.GUIManager = await createGUIManager(this, this.threeManager.container, {
            defaults: {
                fov: defaultCameraConfig.fov
            },
            async onToggleTransformation(mode, show) {
                if (!this.threeManager.transformControls) {
                    this.loading.show();
                    await this.threeManager.initTransformControls();
                    // Fired when user interaction has ended
                    this.threeManager.transformControls.addEventListener('mouseUp', () => {
                        if(this.threeManager.transformControls.getMode() === 'scale') {
                            $('#box-preset').value = '';
                        }
                    });
                    this.loading.hide();
                } else {
                    if (show) {
                        this.threeManager.transformControls.attach(this.threeManager.cube);
                    } else {
                        this.threeManager.transformControls.detach(this.threeManager.cube);
                    }
                }
                if (show) {
                    // Sets the given transformation mode
                    this.threeManager.transformControls.setMode(mode);
                }
                this.threeManager.requestRender();
            },
            onFOVChange(value) {
                this.threeManager.camera.setFocalLength(value);
                this.threeManager.requestRender();
                this.threeManager.cameraProps.updateFromThreeCamera();
            },
            onReset() {
                // Reset cube to its initial rotation and scale
                this.threeManager.cube.rotation.fromArray([0, 0, 0]);
                this.threeManager.cube.scale.fromArray([1, 1, 1]);
                this.threeManager.requestRender();
            }
        });
        this.GUIManager.update({ fov: this.threeManager.cameraProps.fov });
        this.loading.hide();
    }

    /**
     * Set up all event listeners.
     */
    setupEventListeners() {
        // File inputs for image uploads
        const fileInputManager = initializeFileInputs(this.textureManager, {
            onImageLoad: (face, data) => {
                // Update preview
                const uploadItem = $(`.upload-item[data-face="${face}"]`);
                if (uploadItem) {
                    const preview = uploadItem.querySelector('.preview');
                    if (preview) {
                        updatePreview(data.dataURL, preview);
                        uploadItem.classList.add('has-image');
                    }
                }

                // Trigger texture update
                this.threeManager.needsTextureUpdate.push(face);
                this.threeManager.requestRender();
            },
            onImageRemove: (face) => {
                // Trigger texture update
                this.threeManager.needsTextureUpdate.push(face);
                this.threeManager.requestRender();
                const uploadItem = $(`.upload-item[data-face="${face}"]`);
                uploadItem.classList.remove('has-image');
            },
            onError: (error) => {
                this.message?.error(`Image load error: ${error.message}`);
            },
            onLoadingChange: (face, isLoading) => {
                const uploadItem = $(`.upload-item[data-face="${face}"]`);
                if (uploadItem) {
                    const preview = uploadItem.querySelector('.preview');
                    if (preview) {
                        if (isLoading) {
                            preview.classList.add('loading');
                        } else {
                            preview.classList.remove('loading');
                        }
                    }
                }
            }
        });

        // Image drop handlers
        let dragMouseX = 0;
        let dragMouseY = 0;
        this.threeManager.canvas.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
            // Trigger only if mouse has moved
            if (event.clientX !== dragMouseX && event.clientY !== dragMouseY) {
                dragMouseX = event.clientX;
                dragMouseY = event.clientY;
                const faceIndex = this.threeManager.getFaceAt(dragMouseX, dragMouseY);
                if (highlightCubeFace(this.threeManager.cube, faceIndex)) {
                    this.threeManager.requestRender();
                }
            }
        });

        this.threeManager.canvas.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const { highlightedFace } = this.threeManager.cube;
            const face = getCubeFaceName(highlightedFace);
            if (face) {
                fileInputManager.handleDrop(event, face);
                // Reset hovered face
                highlightCubeFace(this.threeManager.cube);
            }
        });

        // Color pickers for cube sides
        const colorInputManager = initializeColorInputs(FACE_INDEX_MAP, {
            onChange: (faceIndex, color) => {
                updateCubeFaceColor(this.threeManager.cube, faceIndex, color);
                this.threeManager.requestRender();
            }
        });

        let mouseDownX = 0;
        let mouseDownY = 0;
        this.threeManager.canvas.addEventListener('mousedown', (event) => {
            mouseDownX = event.clientX;
            mouseDownY = event.clientY;
        });

        this.threeManager.canvas.addEventListener('mouseup', (event) => {
            // If mouse position hasn't changed...
            if (event.clientX === mouseDownX && event.clientY === mouseDownY) {
                const faceIndex = this.threeManager.getFaceAt(event.clientX, event.clientY);
                if (faceIndex > -1) {
                    const face = getCubeFaceName(faceIndex);
                    if (this.threeManager.cube.material[faceIndex].map) {
                        fileInputManager.trigger(face);
                    } else {
                        colorInputManager.trigger(face);
                    }
                }
            }
        });

        // Config manager UI
        this.configManager.setupUI({
            container: $('#config-container'),
            camera: this.threeManager.cameraProps,
            threeCamera: this.threeManager.camera,
            cube: this.threeManager.cube,
            saveButton: $('#save-config'),
            loadButton: $('#load-config'),
            fileInput: $('#config-file-input'),
            viewPreset: $('#view-preset'),
            boxPreset: $('#box-preset')
        });

        // Screenshot button
        const screenshotBtn = $('#screenshot');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', async () => {
                try {
                    this.message?.info('Capturing screenshot...');
                    const scaleFactor = parseInt($('#screenshot-scale')?.value, 10) || 1;
                    const success = await this.screenshotManager.captureAndDownload(this.threeManager, scaleFactor);
                    if (success) {
                        this.message?.success('Screenshot saved!');
                    } else {
                        this.message?.error('Screenshot capture failed');
                    }
                } catch (error) {
                    this.message?.error(`Screenshot error: ${error.message}`);
                }
            });
        }

        // Reset camera button
        const resetViewBtn = $('#reset-view');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => this.doResetCamera());
        }

        // Show hint button
        const showHintBtn = $('#show-hint');
        if (showHintBtn) {
            showHintBtn.addEventListener('click', () => this.showKeyboardShortcutsHelp());
        }

        // Keyboard shortcuts
        this.keyboardShortcuts = new KeyboardShortcuts({
            shortcuts: KEYBOARD_SHORTCUTS,
            handler: (action) => this.handleKeyboardShortcut(action)
        });
        this.keyboardShortcuts.attach();

        // Window resize (debounced)
        window.addEventListener('resize', debounce(() => {
            this.threeManager.handleResize();
            this.threeManager.requestRender();
        }, 300), { passive: true });

        console.log('Event listeners set up');
    }

    /**
     * Handle keyboard shortcut action.
     * @param {string} action - Action to perform
     */
    handleKeyboardShortcut(action) {
        switch (action) {
            case 'save':
                $('#save-config')?.click();
                break;

            case 'load':
                $('#load-config')?.click();
                break;

            case 'screenshot':
                $('#screenshot')?.click();
                break;

            case 'reset':
                this.doResetCamera();
                break;

            case 'advanced':
                if (!this.GUIManager) {
                    this.initGUIManager();
                } else {
                    this.GUIManager.show(this.GUIManager._hidden);
                }
                break;

            case 'help':
                this.showKeyboardShortcutsHelp();
                break;
        }
    }

    /**
     * Show keyboard shortcuts help message.
     */
    showKeyboardShortcutsHelp() {
        const shortcuts = Object.entries(KEYBOARD_SHORTCUTS)
            .map(([key, info]) => `‣ ${key.toUpperCase()}: ${info.description}`)
            .join('\n');

        const controls = `Camera Controls:
            ‣ Drag: Rotate camera
            ‣ Scroll: Zoom in/out`;

        this.message?.info(`Keyboard Shortcuts:\n${shortcuts}\n\n${controls}`, true);
    }

    /**
     * Reset camera to default position.
     */
    doResetCamera() {
        this.threeManager.reset();
        this.message?.info('View reset');
        const viewPreset = $('#view-preset');
        if (viewPreset) {
            viewPreset.value = '';
        }
    }

    /**
     * Show detailed WebGL error message.
     */
    showWebGLError() {
        const errorDiv = $('#webgl-error');
        const canvas = $('#webgl-canvas');
        if (errorDiv) {
            errorDiv.classList.remove('hidden');
        }
        if (canvas) {
            canvas.classList.add('hidden');
        }
    }
}

// Initialize application when DOM is ready
async function initApp() {
    const app = new Cover3DApplication();
    await app.init();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
