import { $, $$ } from 'rtkjs/dom.js';

/**
 * Image Manager Module
 * 
 * Handles image upload, processing, and management for cube faces.
 * Supports PNG, JPG, JPEG, and WebP formats with max 10MB file size.
 */

// Face mapping: face name to cube face index
const faces = {
    front: 0,
    back: 1,
    right: 2,
    left: 3,
    top: 4,
    bottom: 5
};

// Valid MIME types for image uploads
const VALID_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Maximum texture dimension for performance
const MAX_TEXTURE_SIZE = 4096;

/**
 * Creates a new image manager instance.
 * @returns {Object} Image manager with state and methods
 */
export function createTextureManager() {
    const state = {
        imageBitmaps: {
            front: null,
            back: null,
            right: null,
            left: null,
            top: null,
            bottom: null
        },
        loading: {
            front: false,
            back: false,
            right: false,
            left: false,
            top: false,
            bottom: false
        }
    };

    return {
        /**
         * Validates an image file.
         * @param {File} file - The file to validate
         * @returns {Object} Validation result with isValid and error message
         */
        validateImage(file) {
            if (!file) {
                return { isValid: false, error: 'No file provided' };
            }

            // Check file type
            if (!VALID_MIME_TYPES.includes(file.type)) {
                return { 
                    isValid: false, 
                    error: 'Invalid file type. Only PNG, JPG, and WebP are allowed.' 
                };
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                return { 
                    isValid: false, 
                    error: 'File too large. Maximum size is 10MB.' 
                };
            }

            return { isValid: true, error: null };
        },

        /**
         * Loads an image file and converts it to ImageBitmap and dataURL.
         * @param {File} file - The image file to load
         * @returns {Promise<Object>} Object with imageBitmap and dataURL
         */
        async loadImage(file) {
            const validation = this.validateImage(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Convert to dataURL using FileReader
            const dataURL = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });

            // Load as ImageBitmap for WebGL
            let imageBitmap;
            try {
                imageBitmap = await createImageBitmap(file);
            } catch (e) {
                throw new Error(`Failed to create image bitmap: ${e.message}`);
            }

            // Check and resize if too large
            if (imageBitmap.width > MAX_TEXTURE_SIZE || imageBitmap.height > MAX_TEXTURE_SIZE) {
                imageBitmap = await this.resizeImage(imageBitmap);
            }

            return { imageBitmap, dataURL };
        },

        /**
         * Resizes an image if it exceeds maximum dimensions.
         * @param {ImageBitmap} imageBitmap - The original image
         * @returns {Promise<ImageBitmap>} Resized image
         */
        async resizeImage(imageBitmap) {
            const maxSize = MAX_TEXTURE_SIZE;
            let width = imageBitmap.width;
            let height = imageBitmap.height;

            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height / width) * maxSize);
                    width = maxSize;
                } else {
                    width = Math.round((width / height) * maxSize);
                    height = maxSize;
                }
            }

            // Create canvas for resizing
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageBitmap, 0, 0, width, height);

            // Convert back to ImageBitmap
            return createImageBitmap(canvas);
        },

        /**
         * Sets an image for a specific face.
         * @param {string} face - Face name (front, back, right, left, top, bottom)
         * @param {File|ImageBitmap} image - Image file or ImageBitmap
         * @returns {Promise<Object>} Loaded image data
         */
        async setImage(face, image) {
            if (!faces.hasOwnProperty(face)) {
                throw new Error(`Invalid face: ${face}`);
            }

            // If already loading, skip
            if (state.loading[face]) {
                return null;
            }

            state.loading[face] = true;

            try {
                const loaded = await this.loadImage(image);
                const imageBitmap = loaded.imageBitmap;
                const dataURL = loaded.dataURL;

                // Update state
                state.imageBitmaps[face] = imageBitmap;

                return { imageBitmap, dataURL };
            } finally {
                state.loading[face] = false;
            }
        },

        /**
         * Gets the ImageBitmap for a specific face.
         * @param {string} face - Face name
         * @returns {ImageBitmap|string|null} ImageBitmap, a string color or null
         */
        getImageBitmap(face) {
            if (!faces.hasOwnProperty(face)) {
                throw new Error(`Invalid face: ${face}`);
            }
            return state.imageBitmaps[face];
        },

        /**
         * Checks if a face is currently loading.
         * @param {string} face - Face name
         * @returns {boolean} True if loading
         */
        isLoading(face) {
            if (!faces.hasOwnProperty(face)) {
                throw new Error(`Invalid face: ${face}`);
            }
            return state.loading[face];
        },

        /**
         * Removes the image from a specific face, reverting it to a default color.
         * @param {string} face - Face name
         * @param {string} color - Hex color to replace the texture
         */
        removeImage(face, color = '') {
            if (!faces.hasOwnProperty(face)) {
                throw new Error(`Invalid face: ${face}`);
            }
            // Mark image for deletion, and replace with the given color
            state.imageBitmaps[face] = color;
        }
    };
}

/**
 * Creates file input handlers for drag-and-drop and click uploads.
 * @param {Object} textureManager - Image manager instance
 * @param {Object} options - Configuration options
 * @returns {Object} Event handlers
 */
function createFileInputHandlers(textureManager, options = {}) {
    const {
        onImageLoad = () => {},
        onImageRemove = () => {},
        onError = console.error,
        onLoadingChange = () => {}
    } = options;

    /**
     * Handles file selection from input.
     * @param {Event} event - Input change event
     * @param {string} face - Face name
     */
    async function handleFileSelect(event, face) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            onLoadingChange(face, true);
            const data = await textureManager.setImage(face, file);
            if (data) {
                onImageLoad(face, data);
            }
        } catch (error) {
            onError(error);
        } finally {
            onLoadingChange(face, false);
        }
    }

    /**
     * Handles drop event for drag-and-drop.
     * @param {DragEvent} event - Drop event
     * @param {string} face - Face name
     */
    async function handleDrop(event, face) {
        event.preventDefault();
        event.stopPropagation();

        // Remove drag-over styling
        const dropZone = event.currentTarget;
        dropZone.classList.remove('drag-over');

        const file = event.dataTransfer?.files?.[0];
        if (!file) {
            return;
        }

        // Validate and process
        const validation = textureManager.validateImage(file);
        if (!validation.isValid) {
            onError(new Error(validation.error));
            return;
        }

        try {
            onLoadingChange(face, true);
            const data = await textureManager.setImage(face, file);
            if (data) {
                onImageLoad(face, data);
            }
        } catch (error) {
            onError(error);
        } finally {
            onLoadingChange(face, false);
        }
    }

    /**
     * Handles drag over event.
     * @param {DragEvent} event - Drag over event
     */
    function handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Handles drag enter event.
     * @param {DragEvent} event - Drag enter event
     */
    function handleDragEnter(event) {
        const dropZone = event.currentTarget;
        dropZone.classList.add('drag-over');
    }

    /**
     * Handles drag leave event.
     * @param {DragEvent} event - Drag leave event
     */
    function handleDragLeave(event) {
        const dropZone = event.currentTarget;
        dropZone.classList.remove('drag-over');
    }

    /**
     * Initializes file input listeners on an element.
     * @param {HTMLElement} element - Input element or preview container
     * @param {string} face - Face name
     */
    function initializeInput(element, face) {
        const input = element.querySelector('input[type="file"]');
        const preview = element.querySelector('.preview');
        const remove = element.querySelector('.preview-remove');
        const colorPicker = element.querySelector('input[type="color"]');

        if (input) {
            input.addEventListener('change', (e) => handleFileSelect(e, face));
        }

        if (preview) {
            // Click to upload
            preview.addEventListener('click', () => {
                input?.click();
            });

            // Drag and drop
            preview.addEventListener('dragover', handleDragOver);
            preview.addEventListener('dragenter', handleDragEnter);
            preview.addEventListener('dragleave', handleDragLeave);
            preview.addEventListener('drop', (e) => handleDrop(e, face));
        }

        if (remove) {
            remove.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                textureManager.removeImage(face, colorPicker.value);
                updatePreview(null, preview);
                onImageRemove(face);
            });
        }

    }

    return {
        handleFileSelect,
        handleDrop,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        initializeInput
    };
}

/**
 * Updates the preview element for a face.
 * @param {string|null} dataURL - dataBlob or null
 * @param {HTMLElement} previewElement - Preview element
 */
export function updatePreview(dataURL, previewElement) {
    if (!previewElement) return;

    if (dataURL) {
        previewElement.style.backgroundImage = `url(${dataURL})`;
        previewElement.classList.add('has-image');
    } else {
        previewElement.style.backgroundImage = '';
        previewElement.classList.remove('has-image');
    }
}

/**
 * Initializes all file inputs in the document.
 * @param {Object} textureManager - Image manager instance
 * @param {Object} options - Configuration options
 */
export function initializeFileInputs(textureManager, options = {}) {
    const handlers = createFileInputHandlers(textureManager, options);

    // Find all upload items
    const uploadItems = $$('.upload-item[data-face]');

    uploadItems.forEach(item => {
        const face = item.dataset.face;
        if (face && faces.hasOwnProperty(face)) {
            handlers.initializeInput(item, face);
        }
    });

    return {
        handleDrop(e, face) {
            handlers.handleDrop(e, face);
        },
        trigger(face) {
            const picker = $(`.upload-item[data-face="${face}"] input[type="file"]`);
            if (picker) {
                picker.dispatchEvent(new MouseEvent('click'));
            }
        }
    }
}

/**
 * Initializes all file color inputs in the document.
 * @param {Object} faceIndexMap - Face index mapping
 * @param {Object} options - Configuration options
 */
export function initializeColorInputs(faceIndexMap, options = {}) {
    const colorInputs = $$('.color-picker[data-face]');
    colorInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const face = e.target.dataset.face;
            const faceIndex = faceIndexMap[face];
            if (faceIndex !== undefined) {
                options?.onChange?.(faceIndex, e.target.value);
            }
        });
    });

    return {
        trigger(face) {
            const picker = $(`.color-picker[data-face="${face}"]`);
            if (picker) {
                picker.dispatchEvent(new MouseEvent('click'));
            }
        }
    }
}
