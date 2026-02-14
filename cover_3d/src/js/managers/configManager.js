import { parseDOMString } from 'rtkjs/dom.js';

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
         * @param {Object} cameraState - Camera state object
         * @param {THREE.Mesh} cube - Cube mesh object
         * @returns {Object} Configuration object ready for serialization
         */
        saveConfig(cameraState, cube) {
            const { scale } = cube;
            // Create configuration object
            const config = {
                version: CONFIG_VERSION,
                camera: {
                    radius: cameraState.radius,
                    theta: cameraState.theta,
                    phi: cameraState.phi,
                    fov: parseInt(cameraState.fov, 10)
                },
                box: {
                    name: cube.name,
                    width: cube.geometry.parameters.width * scale.x,
                    height: cube.geometry.parameters.height * scale.y,
                    depth: cube.geometry.parameters.depth * scale.z,
                    rotation: cameraState.rotation
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
            const link = parseDOMString(`<a href="${url}" download="${filename}" class="hidden"></a>`);
            
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
                
                const cameraKeys = ['radius', 'theta', 'phi', 'fov'];
                for (const key of cameraKeys) {
                    const value = config.camera[key];
                    if (value !== undefined && typeof value !== 'number') {
                        return { isValid: false, error: `Invalid camera.${key}: must be a number` };
                    }
                }
            }

            // Check box structure
            if (config.box) {
                if (typeof config.box !== 'object') {
                    return { isValid: false, error: 'Invalid box configuration' };
                }
                
                const boxKeys = ['width', 'height', 'depth', 'rotation'];
                for (const key of boxKeys) {
                    const value = config.box[key];
                    if (key === 'rotation') {
                        if (value !== undefined && (!Array.isArray(value) || !value.every((v) => typeof v === 'number'))) {
                            return { isValid: false, error: `Invalid camera.${key}: must be an array with 3 numbers` };
                        }
                    } else if (value !== undefined && typeof value !== 'number') {
                        return { isValid: false, error: `Invalid box.${key}: must be a number` };
                    }
                }
            }

            return { isValid: true, error: null };
        },

        /**
         * Complete save operation: saves and downloads configuration.
         * @param {Object} cameraState - Camera object
         * @param {THREE.Mesh} cube - Cube mesh object
         * @param {string} customName - Optional custom filename
         * @returns {Promise<Object>} Result with filename and size info
         */
        async save(cameraState, cube, customName = null) {
            const config = this.saveConfig(cameraState, cube);
            const downloadResult = this.downloadConfig(config, customName);
            return downloadResult;
        },

        /**
         * Complete load operation: reads, validates, and applies configuration.
         * @param {File} file - Configuration file to load
         * @param {Object} cameraState - Camera state object to update
         * @param {ThreeManager} threeManager - Three.js manager
         * @returns {Promise<Object>} Result with validation and application status
         */
        async load(file, cameraState, threeManager) {
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
         * @param {Object} cameraState - Camera state object
         * @param {THREE.Mesh} cube - Cube mesh object
         */
        async saveAndDownload(cameraState, cube) {
            try {
                onProgress('Saving configuration...');
                const result = await manager.save(cameraState, cube);
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
         * @param {Object} cameraState - Camera state object
         * @param {ThreeManager} threeManager - Three.js manager
         */
        async loadFromFile(file, cameraState, threeManager) {
            try {
                onProgress('Loading configuration...');
                const result = await manager.load(file, cameraState, threeManager);
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
         * @param {Object} params - Parameters with camera, threeManager and UI elements
         */
        setupUI({ container, cameraState, threeManager, saveButton, loadButton, fileInput, viewPreset, boxPreset }) {
            // Helper to handle config load results and update UI accordingly
            const onLoadFromFile = (result) => {
                if (!result.success) {
                    return;
                }
                // Reset view select
                viewPreset.value = '';
                const { name } = result.config.box;
                if (name === 'custom') {
                    boxPreset.value = '';
                }
                if (name) {
                    // Select box preset option from config
                    for(const option of boxPreset.options) {
                        if (option.textContent === name) {
                            boxPreset.value = option.value;
                            break;
                        }
                    }
                }
            };

            // Drag and drop
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            container.addEventListener('dragenter', (e) => {
                e.currentTarget.classList.add('drag-over');
            });
            container.addEventListener('dragleave', (e) => {
                // Only remove drag-over class if leaving the container and not when hovering over children
                if (!e.relatedTarget.closest(`#${container.id}`)) {
                    e.currentTarget.classList.remove('drag-over');
                }
            });
            container.addEventListener('drop', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('drag-over');
                const file = e.dataTransfer?.files?.[0];
                if (!file) {
                    return;
                }
                const result = await this.loadFromFile(file, cameraState, threeManager);
                onLoadFromFile(result);
            });

            // Save button
            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    this.saveAndDownload(cameraState, threeManager.cube);
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
                        const result = await this.loadFromFile(file, cameraState, threeManager);
                        // Reset input so same file can be selected again
                        e.target.value = '';
                        onLoadFromFile(result);
                    }
                });
            }

            // Config preset
            if (viewPreset) {
                // Populate select with predefined configurations
                let optionsHTML = viewPreset.innerHTML;
                for (const key of Object.keys(VIEWS)) {
                    optionsHTML += `<option value="${key}">${VIEWS[key].name}</<option>`;
                }
                viewPreset.innerHTML = optionsHTML;
                
                // Add change event listener
                viewPreset.addEventListener('change', async (event) => {
                    const selectedKey = event.target.value;
                    if (!selectedKey) {
                        return;
                    }
                    const { config } = VIEWS[selectedKey];
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
                let optionsHTML = boxPreset.innerHTML;
                for (const key of Object.keys(BOXES)) {
                    optionsHTML += `<option value="${key}">${BOXES[key].name}</<option>`;
                }
                boxPreset.innerHTML = optionsHTML;
                
                // Add change event listener
                boxPreset.addEventListener('change', async (event) => {
                    const selectedKey = event.target.value;
                    if (!selectedKey) {
                        return;
                    }
                    const box = BOXES[selectedKey];
                    const { width, height, depth } = box.config;
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
