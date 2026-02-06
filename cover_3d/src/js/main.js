/**
 * Cover 3D - Main Application Entry Point
 * 
 * Uses Three.js for 3D box cover visualization.
 * Implements on-demand rendering for improved performance.
 */

import { createThreeManager, faceIndexMap } from './managers/3dManager.js';
import { createImageManager, initializeFileInputs, updatePreview } from './managers/imageManager.js';
import { createConfigManagerUI } from './managers/configManager.js';
import { createScreenshotManager } from './managers/screenshotManager.js';
import { Zoom } from './components/zoom.js';
import { Loading } from './components/loading.js';
import { Message } from './components/message.js';
import { KeyboardShortcuts, KEYBOARD_SHORTCUTS } from './components/keyboardShortcuts.js';
import { debounce } from './utils/debounce.js';

/**
 * Main application class that coordinates all modules.
 */
export class Cover3DApplication {
    constructor() {
        // Three.js manager
        this.threeManager = null;
        
        // Camera state (delegated to threeManager)
        this.cameraObj = null;
        
        // Managers
        this.threeManager = null;
        this.imageManager = null;
        this.configManager = null;
        this.screenshotManager = null;
        
        // UI elements
        this.zoom = null;
        this.loading = null;
        this.message = null;
        this.keyboardShortcuts = null;
        
        // State
        this.isInitialized = false;
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
            const canvas = document.getElementById('webgl-canvas');
            const container = document.getElementById('canvas-container');
            
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Initialize managers
            await this.initManagers(canvas, container);
            
            // Get camera state reference
            this.cameraObj = this.threeManager.getCameraState();
            
            // Create zoom indicator
            this.zoom = new Zoom(container, {
                minRadius: this.cameraObj.minRadius,
                maxRadius: this.cameraObj.maxRadius
            });
            this.zoom.update(this.cameraObj);
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initial resize and render
            this.threeManager.handleResize();
            this.threeManager.requestRender();
            
            this.isInitialized = true;
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
        // Initialize Three.js manager
        this.threeManager = createThreeManager({
            canvas,
            container,
            onCameraChange: (cameraState) => {
                if (this.zoom) {
                    this.zoom.update(cameraState);
                }
            }
        });
        
        // Initialize Three.js
        try {
            await this.threeManager.init();
        } catch(err) {
            throw new Error('WebGL is not supported by your browser');
        }
        this.threeManager.initCamera();
        this.threeManager.initCube();
        
        // Image manager
        this.imageManager = createImageManager();
        
        // Set image manager reference for texture updates
        this.threeManager.imageManager = this.imageManager;
        this.threeManager.faceIndexMap = faceIndexMap;
        
        // Config manager with UI integration
        this.configManager = createConfigManagerUI({
            onSave: (result) => {
                this.message?.success(`Configuration saved: ${result.filename}`);
            },
            onLoad: (result) => {
                if (result.success) {
                    this.message?.success('Configuration loaded!');
                    this.threeManager.needsTextureUpdate = true;
                    this.threeManager.requestRender();
                } else {
                    this.message?.error('Failed to load configuration.');
                }
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
     * Set up all event listeners.
     */
    setupEventListeners() {
        // File inputs for image uploads
        initializeFileInputs(this.imageManager, {
            onImageLoad: (face, data) => {
                // Update preview
                const uploadItem = document.querySelector(`.upload-item[data-face="${face}"]`);
                if (uploadItem) {
                    const preview = uploadItem.querySelector('.preview');
                    if (preview) {
                        updatePreview(data.dataUrl, preview);
                        uploadItem.classList.add('has-image');
                    }
                }
                
                // Trigger texture update
                this.threeManager.needsTextureUpdate = true;
                this.threeManager.requestRender();
            },
            onError: (error) => {
                this.message?.error(`Image load error: ${error.message}`);
            },
            onLoadingChange: (face, isLoading) => {
                const uploadItem = document.querySelector(`.upload-item[data-face="${face}"]`);
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
        
        // Config manager UI
        this.configManager.setupUI({
            camera: this.cameraObj,
            threeCamera: this.threeManager.camera,
            imageManager: this.imageManager,
            saveButton: document.getElementById('save-config'),
            loadButton: document.getElementById('load-config'),
            fileInput: document.getElementById('config-file-input')
        });
        
        // Screenshot button
        const screenshotBtn = document.getElementById('screenshot');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', async () => {
                try {
                    this.message?.info('Capturing screenshot...');
                    const success = await this.screenshotManager.captureAndDownload(this.threeManager, 2);
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
        const resetCameraBtn = document.getElementById('reset-camera');
        if (resetCameraBtn) {
            resetCameraBtn.addEventListener('click', () => this.doResetCamera());
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
                document.getElementById('save-config')?.click();
                break;
            
            case 'load':
                document.getElementById('load-config')?.click();
                break;
            
            case 'screenshot':
                document.getElementById('screenshot')?.click();
                break;
            
            case 'reset':
                this.doResetCamera();
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
            .map(([key, info]) => `• ${key.toUpperCase()}: ${info.description}`)
            .join('\n');
        
        this.message?.info(`Keyboard Shortcuts:\n${shortcuts}`);
    }

    /**
     * Reset camera to default position.
     */
    doResetCamera() {
        this.threeManager.resetCamera();
        this.message?.info('Camera reset');
    }

    /**
     * Show detailed WebGL error message.
     */
    showWebGLError() {
        const errorDiv = document.getElementById('webgl-error');
        const canvas = document.getElementById('webgl-canvas');
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
