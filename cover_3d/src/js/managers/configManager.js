/**
 * Configuration Manager Module
 * 
 * Handles saving and loading of configuration files for the Cover 3D application.
 * Supports JSON serialization/deserialization with version checking.
 */

// Configuration version for future compatibility
const CONFIG_VERSION = '1.0';

// Valid face names for validation
const VALID_FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'];

// Maximum file size warning threshold (5MB)
const SIZE_WARNING_THRESHOLD = 5 * 1024 * 1024;

/**
 * Gets the current timestamp in a format suitable for filenames.
 * @returns {string} Timestamp string (YYYY-MM-DD_HH-mm-ss)
 */
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

/**
 * Sanitizes a string for use in filenames.
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeFilename(str) {
    return str.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
}

/**
 * Calculates the approximate size of a JSON string in bytes.
 * @param {Object} obj - Object to measure
 * @returns {number} Approximate size in bytes
 */
function getJsonSize(obj) {
    try {
        return new Blob([JSON.stringify(obj)]).size;
    } catch (e) {
        return 0;
    }
}

/**
 * Creates a new configuration manager instance.
 * @returns {Object} Configuration manager with methods
 */
function createConfigManager() {
    return {
        /**
         * Gets the default empty configuration.
         * @returns {Object} Default configuration structure
         */
        getDefaultConfig() {
            return {
                version: CONFIG_VERSION,
                camera: {
                    radius: 5,
                    theta: 0,
                    phi: Math.PI / 3
                }
            };
        },

        /**
         * Saves the current camera and image state to a configuration object.
         * @param {Object} camera - Camera object from createCamera()
         * @param {Object} imageManager - Image manager instance
         * @returns {Object} Configuration object ready for serialization
         */
        saveConfig(camera, imageManager) {
            // Get camera state
            const cameraState = {
                radius: camera.radius,
                theta: camera.theta,
                phi: camera.phi
            };

            // Get image data URLs
            const imageDataUrls = imageManager.getImageDataUrls();

            // Create configuration object
            const config = {
                version: CONFIG_VERSION,
                camera: cameraState,
                images: imageDataUrls,
                metadata: {
                    createdAt: new Date().toISOString(),
                    application: 'Cover 3D'
                }
            };

            return config;
        },

        /**
         * Downloads a configuration object as a JSON file.
         * @param {Object} config - Configuration object to download
         * @param {string} customName - Optional custom filename (without extension)
         */
        downloadConfig(config, customName = null) {
            // Serialize to JSON with pretty formatting
            const jsonString = JSON.stringify(config, null, 2);
            
            // Check file size
            const size = new Blob([jsonString]).size;
            const sizeMB = (size / (1024 * 1024)).toFixed(2);
            
            if (size > SIZE_WARNING_THRESHOLD) {
                console.warn(`Configuration file is large (${sizeMB}MB). This may cause issues with some browsers.`);
            }

            // Create filename
            const timestamp = getTimestamp();
            const baseName = customName || 'cover3d_config';
            const filename = `${sanitizeFilename(baseName)}_${timestamp}.json`;

            // Create blob and download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up URL
            URL.revokeObjectURL(url);

            return {
                filename,
                size: size,
                sizeMB: parseFloat(sizeMB)
            };
        },

        /**
         * Loads a configuration file and returns the parsed JSON.
         * @param {File} file - JSON file to load
         * @returns {Promise<Object>} Parsed configuration object
         */
        loadConfig(file) {
            return new Promise((resolve, reject) => {
                // Validate file type
                if (!file.name.endsWith('.json') && file.type !== 'application/json') {
                    reject(new Error('Invalid file type. Please select a JSON file.'));
                    return;
                }

                // Read file
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    try {
                        const config = JSON.parse(event.target.result);
                        resolve(config);
                    } catch (e) {
                        reject(new Error('Failed to parse JSON file. The file may be corrupted.'));
                    }
                };
                
                reader.onerror = () => {
                    reject(new Error('Failed to read configuration file.'));
                };
                
                reader.readAsText(file);
            });
        },

        /**
         * Validates a configuration object's structure and version.
         * @param {Object} config - Configuration object to validate
         * @returns {Object} Validation result with isValid and error message
         */
        validateConfig(config) {
            // Check if config exists
            if (!config || typeof config !== 'object') {
                return { isValid: false, error: 'Invalid configuration: not an object' };
            }

            // Check version
            if (!config.version) {
                return { isValid: false, error: 'Invalid configuration: missing version' };
            }

            // Check version compatibility
            const majorVersion = config.version.split('.')[0];
            if (majorVersion !== CONFIG_VERSION.split('.')[0]) {
                return { 
                    isValid: false, 
                    error: `Incompatible version: ${config.version}. Expected version ${CONFIG_VERSION} or compatible.` 
                };
            }

            // Check camera structure
            if (config.camera) {
                if (typeof config.camera !== 'object') {
                    return { isValid: false, error: 'Invalid camera configuration' };
                }
                
                const cameraKeys = ['radius', 'theta', 'phi'];
                for (const key of cameraKeys) {
                    if (config.camera[key] !== undefined && typeof config.camera[key] !== 'number') {
                        return { isValid: false, error: `Invalid camera.${key}: must be a number` };
                    }
                }
            }

            return { isValid: true, error: null };
        },

        /**
         * Applies a configuration to the camera and image manager.
         * @param {Object} config - Validated configuration object
         * @param {Object} camera - Camera state object to update
         * @param {THREE.Camera} threeCamera - Three.js camera to update
         * @returns {Promise<Object>} Result with applied faces and any errors
         */
        async applyConfig(config, camera, threeCamera) {
            // Import setCameraState and setCameraPosition from camera module
            const { setCameraState, setCameraPosition } = await import('../objects/camera.js');
            
            // Apply camera state
            if (config.camera) {
                setCameraState(camera, config.camera);
                setCameraPosition(camera, threeCamera);
            }
        },

        /**
         * Complete save operation: saves and downloads configuration.
         * @param {Object} camera - Camera object
         * @param {Object} imageManager - Image manager instance
         * @param {string} customName - Optional custom filename
         * @returns {Promise<Object>} Result with filename and size info
         */
        async save(camera, imageManager, customName = null) {
            const config = this.saveConfig(camera, imageManager);
            const downloadResult = this.downloadConfig(config, customName);
            return downloadResult;
        },

        /**
         * Complete load operation: reads, validates, and applies configuration.
         * @param {File} file - Configuration file to load
         * @param {Object} camera - Camera state object to update
         * @param {THREE.Camera} threeCamera - Three.js camera to update
         * @param {Object} imageManager - Image manager to update
         * @returns {Promise<Object>} Result with validation and application status
         */
        async load(file, camera, threeCamera, imageManager) {
            // Load file
            let config;
            try {
                config = await this.loadConfig(file);
            } catch (e) {
                return {
                    success: false,
                    error: e.message
                };
            }

            // Validate
            const validation = this.validateConfig(config);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error
                };
            }

            // Apply
            await this.applyConfig(config, camera, threeCamera);

            return {
                success: true,
                config,
                message: `Configuration loaded successfully.`
            };
        }
    };
}

/**
 * Creates a configuration manager with UI integration helpers.
 * @param {Object} options - Configuration options
 * @returns {Object} Config manager with UI methods
 */
export function createConfigManagerUI(options = {}) {
    const {
        onSave = () => {},
        onLoad = () => {},
        onError = console.error,
        onProgress = () => {}
    } = options;

    const manager = createConfigManager();

    return {
        ...manager,

        /**
         * Saves the current configuration and triggers download.
         * @param {Object} camera - Camera object
         * @param {Object} imageManager - Image manager instance
         */
        async saveAndDownload(camera, imageManager) {
            try {
                onProgress('Saving configuration...');
                const result = await manager.save(camera, imageManager);
                onSave(result);
                onProgress('');
                return result;
            } catch (e) {
                onError(e);
                onProgress('');
                throw e;
            }
        },

        /**
         * Loads a configuration from a file.
         * @param {File} file - Configuration file
         * @param {Object} camera - Camera state object
         * @param {THREE.Camera} threeCamera - Three.js camera
         * @param {Object} imageManager - Image manager instance
         */
        async loadFromFile(file, camera, threeCamera, imageManager) {
            try {
                onProgress('Loading configuration...');
                const result = await manager.load(file, camera, threeCamera, imageManager);
                onLoad(result);
                onProgress('');
                return result;
            } catch (e) {
                onError(e);
                onProgress('');
                throw e;
            }
        },

        /**
         * Sets up UI event listeners for save/load buttons.
         * @param {Object} params - Parameters with camera, threeCamera, imageManager, and UI elements
         */
        setupUI({ camera, threeCamera, imageManager, saveButton, loadButton, fileInput }) {
            // Save button
            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    this.saveAndDownload(camera, imageManager);
                });
            }

            // Load button
            if (loadButton) {
                loadButton.addEventListener('click', () => {
                    fileInput?.click();
                });
            }

            // File input change
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        this.loadFromFile(file, camera, threeCamera, imageManager);
                        // Reset input so same file can be selected again
                        e.target.value = '';
                    }
                });
            }
        }
    };
}
