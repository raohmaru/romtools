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

// Reverse mapping: index to face name
const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];

// Human-readable face labels
const faceLabels = {
    front: 'Front',
    back: 'Back',
    right: 'Right',
    left: 'Left',
    top: 'Top',
    bottom: 'Bottom'
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
export function createImageManager() {
    const state = {
        images: {
            front: null,
            back: null,
            right: null,
            left: null,
            top: null,
            bottom: null
        },
        dataUrls: {
            front: null,
            back: null,
            right: null,
            left: null,
            top: null,
            bottom: null
        },
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
         * Gets the face mapping object.
         * @returns {Object} Face name to index mapping
         */
        getFaceMapping() {
            return { ...faces };
        },

        /**
         * Gets human-readable label for a face.
         * @param {string} face - Face name
         * @returns {string} Human-readable label
         */
        getFaceLabel(face) {
            return faceLabels[face] || face;
        },

        /**
         * Gets all face names.
         * @returns {Array<string>} Array of face names
         */
        getAllFaceNames() {
            return [...faceNames];
        },

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
         * Loads an image file and converts it to ImageBitmap and DataURL.
         * @param {File} file - The image file to load
         * @returns {Promise<Object>} Object with imageBitmap and dataUrl
         */
        async loadImage(file) {
            const validation = this.validateImage(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Convert to DataURL using FileReader
            const dataUrl = await new Promise((resolve, reject) => {
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

            return { imageBitmap, dataUrl };
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
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
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
                let imageBitmap;
                let dataUrl;

                if (image instanceof File) {
                    const loaded = await this.loadImage(image);
                    imageBitmap = loaded.imageBitmap;
                    dataUrl = loaded.dataUrl;
                } else if (image instanceof ImageBitmap) {
                    // Check and resize if too large
                    if (image.width > MAX_TEXTURE_SIZE || image.height > MAX_TEXTURE_SIZE) {
                        imageBitmap = await this.resizeImage(image);
                    } else {
                        imageBitmap = image;
                    }
                    dataUrl = await this.imageBitmapToDataUrl(imageBitmap);
                } else {
                    throw new Error('Invalid image type. Expected File or ImageBitmap.');
                }

                // Update state
                state.images[face] = imageBitmap;
                state.imageBitmaps[face] = imageBitmap;
                state.dataUrls[face] = dataUrl;

                return { imageBitmap, dataUrl };
            } finally {
                state.loading[face] = false;
            }
        },

        /**
         * Converts an ImageBitmap to DataURL.
         * @param {ImageBitmap} imageBitmap - The image bitmap
         * @returns {Promise<string>} DataURL string
         */
        async imageBitmapToDataUrl(imageBitmap) {
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageBitmap, 0, 0);
            return canvas.toDataURL('image/png');
        },

        /**
         * Clears the image for a specific face.
         * @param {string} face - Face name
         */
        clearImage(face) {
            if (!faces.hasOwnProperty(face)) {
                throw new Error(`Invalid face: ${face}`);
            }

            // Clean up ImageBitmap memory
            if (state.imageBitmaps[face]) {
                state.imageBitmaps[face].close?.();
                state.imageBitmaps[face] = null;
            }

            state.images[face] = null;
            state.dataUrls[face] = null;
        },

        /**
         * Gets the image for a specific face.
         * @param {string} face - Face name
         * @returns {ImageBitmap|null} ImageBitmap or null
         */
        getImage(face) {
            if (!faces.hasOwnProperty(face)) {
                throw new Error(`Invalid face: ${face}`);
            }
            return state.images[face];
        },

        /**
         * Gets the ImageBitmap for a specific face.
         * @param {string} face - Face name
         * @returns {ImageBitmap|null} ImageBitmap or null
         */
        getImageBitmap(face) {
            if (!faces.hasOwnProperty(face)) {
                throw new Error(`Invalid face: ${face}`);
            }
            return state.imageBitmaps[face];
        },

        /**
         * Gets the DataURL for a specific face.
         * @param {string} face - Face name
         * @returns {string|null} DataURL or null
         */
        getDataUrl(face) {
            if (!faces.hasOwnProperty(face)) {
                throw new Error(`Invalid face: ${face}`);
            }
            return state.dataUrls[face];
        },

        /**
         * Checks if a face has an image.
         * @param {string} face - Face name
         * @returns {boolean} True if face has an image
         */
        hasImage(face) {
            if (!faces.hasOwnProperty(face)) {
                throw new Error(`Invalid face: ${face}`);
            }
            return state.images[face] !== null;
        },

        /**
         * Gets all images as an object.
         * @returns {Object} Object with face names as keys and ImageBitmaps as values
         */
        getAllImages() {
            return { ...state.images };
        },

        /**
         * Gets all ImageBitmaps as an object.
         * @returns {Object} Object with face names as keys and ImageBitmaps as values
         */
        getAllImageBitmaps() {
            return { ...state.imageBitmaps };
        },

        /**
         * Sets all images from an object.
         * @param {Object} images - Object with face names as keys and ImageBitmaps as values
         */
        setAllImages(images) {
            for (const face of faceNames) {
                if (images[face]) {
                    state.images[face] = images[face];
                    state.imageBitmaps[face] = images[face];
                }
            }
        },

        /**
         * Gets all images as DataURLs (for configuration save).
         * @returns {Object} Object with face names as keys and DataURLs as values
         */
        getImageDataUrls() {
            return { ...state.dataUrls };
        },

        /**
         * Sets all images from DataURLs (for configuration load).
         * @param {Object} dataUrls - Object with face names as keys and DataURLs as values
         * @returns {Promise<void>}
         */
        async setImageDataUrls(dataUrls) {
            for (const face of faceNames) {
                if (dataUrls[face]) {
                    try {
                        const response = await fetch(dataUrls[face]);
                        const blob = await response.blob();
                        const imageBitmap = await createImageBitmap(blob);
                        state.images[face] = imageBitmap;
                        state.imageBitmaps[face] = imageBitmap;
                        state.dataUrls[face] = dataUrls[face];
                    } catch (e) {
                        console.error(`Failed to load image for ${face}:`, e);
                    }
                }
            }
        },

        /**
         * Checks if any face has an image.
         * @returns {boolean} True if any face has an image
         */
        hasAnyImage() {
            return faceNames.some(face => state.images[face] !== null);
        },

        /**
         * Gets the number of faces with images.
         * @returns {number} Count of faces with images
         */
        getImageCount() {
            return faceNames.filter(face => state.images[face] !== null).length;
        },

        /**
         * Clears all images.
         */
        clearAllImages() {
            for (const face of faceNames) {
                this.clearImage(face);
            }
        },

        /**
         * Gets the internal state for debugging.
         * @returns {Object} Copy of internal state
         */
        getState() {
            return {
                images: { ...state.images },
                dataUrls: { ...state.dataUrls },
                imageBitmaps: { ...state.imageBitmaps },
                loading: { ...state.loading }
            };
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
        }
    };
}

/**
 * Creates file input handlers for drag-and-drop and click uploads.
 * @param {Object} imageManager - Image manager instance
 * @param {Object} options - Configuration options
 * @returns {Object} Event handlers
 */
function createFileInputHandlers(imageManager, options = {}) {
    const {
        onImageLoad = () => {},
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
            const data = await imageManager.setImage(face, file);
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
        if (!file) return;

        // Validate and process
        const validation = imageManager.validateImage(file);
        if (!validation.isValid) {
            onError(new Error(validation.error));
            return;
        }

        try {
            onLoadingChange(face, true);
            const data = await imageManager.setImage(face, file);
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
    }

    /**
     * Cleans up event listeners on an element.
     * @param {HTMLElement} element - Element to clean up
     * @param {string} face - Face name
     */
    function cleanupInput(element, face) {
        const input = element.querySelector('input[type="file"]');
        const preview = element.querySelector('.preview');

        if (input) {
            input.removeEventListener('change', (e) => handleFileSelect(e, face));
        }

        if (preview) {
            preview.removeEventListener('click', () => {
                input?.click();
            });
            preview.removeEventListener('dragover', handleDragOver);
            preview.removeEventListener('dragenter', handleDragEnter);
            preview.removeEventListener('dragleave', handleDragLeave);
            preview.removeEventListener('drop', (e) => handleDrop(e, face));
        }
    }

    return {
        handleFileSelect,
        handleDrop,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        initializeInput,
        cleanupInput
    };
}

/**
 * Updates the preview element for a face.
 * @param {string|null} dataUrl - DataURL or null
 * @param {HTMLElement} previewElement - Preview element
 */
export function updatePreview(dataUrl, previewElement) {
    if (!previewElement) return;

    if (dataUrl) {
        previewElement.style.backgroundImage = `url(${dataUrl})`;
        previewElement.classList.add('has-image');
    } else {
        previewElement.style.backgroundImage = '';
        previewElement.classList.remove('has-image');
    }
}

/**
 * Initializes all file inputs in the document.
 * @param {Object} imageManager - Image manager instance
 * @param {Object} options - Configuration options
 * @returns {Object} Cleanup function and handlers
 */
export function initializeFileInputs(imageManager, options = {}) {
    const handlers = createFileInputHandlers(imageManager, options);
    const cleanupFunctions = [];

    // Find all upload items
    const uploadItems = document.querySelectorAll('.upload-item[data-face]');

    uploadItems.forEach(item => {
        const face = item.dataset.face;
        if (face && faces.hasOwnProperty(face)) {
            handlers.initializeInput(item, face);
            cleanupFunctions.push(() => handlers.cleanupInput(item, face));
        }
    });

    return {
        handlers,
        cleanup: () => cleanupFunctions.forEach(fn => fn())
    };
}
