/**
 * Configuration Manager Module
 * 
 * Handles saving and loading of configuration files for the Cover 3D application.
 * Supports JSON serialization/deserialization with version checking.
 */

import { CONFIG_VERSION, VIEWS } from '../configs/views.js';
import { BOXES, BOX_SCALE_FACTOR } from '../configs/boxes.js';

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
 * Creates a new configuration manager instance.
 * @returns {Object} Configuration manager with methods
 */
function createConfigManager() {
    return {
        /**
         * Saves the current camera and image state to a configuration object.
         * @param {Object} camera - Camera object from createCamera()
         * @returns {Object} Configuration object ready for serialization
         */
        saveConfig(camera, cube) {
            // Create configuration object
            const config = {
                version: CONFIG_VERSION,
                camera: {
                    radius: camera.radius,
                    theta: camera.theta,
                    phi: camera.phi
                },
                box: {
                    name: cube.name,
                    width: cube.geometry.parameters.width,
                    height: cube.geometry.parameters.height,
                    depth: cube.geometry.parameters.depth
                },
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

            // Check box structure
            if (config.box) {
                if (typeof config.box !== 'object') {
                    return { isValid: false, error: 'Invalid box configuration' };
                }
                
                const boxKeys = ['width', 'height', 'depth'];
                for (const key of boxKeys) {
                    if (config.box[key] !== undefined && typeof config.box[key] !== 'number') {
                        return { isValid: false, error: `Invalid box.${key}: must be a number` };
                    }
                }
            }

            return { isValid: true, error: null };
        },

        /**
         * Applies a configuration to the camera and cube.
         * @param {Object} config - Validated configuration object
         * @param {Object} camera - Camera state object to update
         * @param {THREE.Camera} threeCamera - Three.js camera to update
         * @param {Object} cube - Cube state object to update
         * @returns {Promise<Object>} Result with applied faces and any errors
         */
        async applyConfig({ config, camera, threeCamera, cube }) {
            const { setCameraState, setCameraPosition } = await import('../objects/camera.js');
            const { setCubeDimensions } = await import('../objects/cube.js');
            
            // Apply camera state
            if (config.camera) {
                setCameraState(camera, config.camera);
                setCameraPosition(camera, threeCamera);
            }
            
            // Apply cube state
            if (config.box) {
                setCubeDimensions(cube, config.box);
                cube.name = config.box.name;
            }
        },

        /**
         * Complete save operation: saves and downloads configuration.
         * @param {Object} camera - Camera object
         * @param {Object} cube - Cube object
         * @param {string} customName - Optional custom filename
         * @returns {Promise<Object>} Result with filename and size info
         */
        async save(camera, cube, customName = null) {
            const config = this.saveConfig(camera, cube);
            const downloadResult = this.downloadConfig(config, customName);
            return downloadResult;
        },

        /**
         * Complete load operation: reads, validates, and applies configuration.
         * @param {File} file - Configuration file to load
         * @param {Object} camera - Camera state object to update
         * @param {THREE.Camera} threeCamera - Three.js camera to update
         * @param {Object} cube - Cube state object to update
         * @returns {Promise<Object>} Result with validation and application status
         */
        async load(file, camera, threeCamera, cube) {
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
            await this.applyConfig({ config, camera, threeCamera, cube });

            return {
                success: true,
                config,
                message: `Configuration loaded!`
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
        onViewChange  = () => {},
        onBoxChange = () => {},
        onError = console.error,
        onProgress = () => {}
    } = options;

    const manager = createConfigManager();

    return {
        ...manager,

        /**
         * Saves the current configuration and triggers download.
         * @param {Object} camera - Camera object
         */
        async saveAndDownload(camera, cube) {
            try {
                onProgress('Saving configuration...');
                const result = await manager.save(camera, cube);
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
         * @param {Object} cube - Cube state object
         */
        async loadFromFile(file, camera, threeCamera, cube) {
            try {
                onProgress('Loading configuration...');
                const result = await manager.load(file, camera, threeCamera, cube);
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
         * @param {Object} params - Parameters with camera, threeCamera and UI elements
         */
        setupUI({ camera, threeCamera, cube, saveButton, loadButton, fileInput, viewPreset, boxPreset }) {
            // Save button
            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    this.saveAndDownload(camera, cube);
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
                fileInput.addEventListener('change', async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const result = await this.loadFromFile(file, camera, threeCamera, cube);
                        // Reset input so same file can be selected again
                        e.target.value = '';
                        if (result.success) {
                            // Reset view seelct
                            viewPreset.value = '';
                            const { name } = result.config.box;
                            if (name) {
                                // Select box preset option from config
                                for(const option of boxPreset.options) {
                                    if (option.textContent === name) {
                                        boxPreset.value = option.value;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Config preset
            if (viewPreset) {
                // Populate select with predefined configurations
                for (const key of Object.keys(VIEWS)) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = VIEWS[key].name;
                    viewPreset.appendChild(option);
                }
                
                // Add change event listener
                viewPreset.addEventListener('change', async (event) => {
                    const selectedKey = event.target.value;
                    if (!selectedKey) {
                        return;
                    }
                    const { config } = VIEWS[selectedKey];
                    await this.applyConfig({ config, camera, threeCamera });
                    const result = {
                        success: true,
                        config,
                        message: `View preset: ${VIEWS[selectedKey].name}`
                    };
                    onViewChange(result);
                });
            }

            // Config preset
            if (boxPreset) {
                // Populate select with predefined configurations
                for (const key of Object.keys(BOXES)) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = BOXES[key].name;
                    boxPreset.appendChild(option);
                }
                
                // Add change event listener
                boxPreset.addEventListener('change', async (event) => {
                    const selectedKey = event.target.value;
                    if (!selectedKey) {
                        return;
                    }
                    const box = BOXES[selectedKey];
                    const { width, height, depth } = box.config;
                    await this.applyConfig({ config: box.config, cube });
                    onBoxChange({
                        ...box,
                        config: {
                            // Box dimensions come in centimeters and needs to be converted to user space
                            width: width * BOX_SCALE_FACTOR,
                            height: height * BOX_SCALE_FACTOR,
                            depth: depth * BOX_SCALE_FACTOR
                        }
                    });
                });
            }
        }
    };
}
