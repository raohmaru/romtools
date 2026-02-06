/**
 * Screenshot Manager
 * 
 * Handles screenshot capture from Three.js WebGPURenderer canvas.
 * Uses Three.js built-in screenshot capabilities.
 */

/**
 * Creates a screenshot manager instance.
 * @returns {Object} Screenshot manager with capture, conversion, and download methods
 */
export function createScreenshotManager() {
    // Track if a screenshot is currently being captured
    let isCapturing = false;
    
    /**
     * Gets a timestamp-based filename for screenshots.
     * Format: cover3d_screenshot_YYYY-MM-DD_HH-mm-ss.png
     * @returns {string} Generated filename
     */
    function getScreenshotFilename() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        return `cover3d_screenshot_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.png`;
    }
    
    /**
     * Downloads a blob as a file using a temporary anchor element.
     * @param {Blob} blob - The blob to download
     * @param {string} filename - The filename for the download
     */
    function downloadScreenshot(blob, filename) {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        
        // Trigger download
        document.body.appendChild(anchor);
        anchor.click();
        
        // Clean up
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        
        console.log(`Screenshot saved: ${filename}`);
    }
    
    /**
     * Captures the current canvas frame and converts it to a PNG blob.
     * Uses Three.js WebGPURenderer capabilities.
     * 
     * @param {WebGPURenderer} threeManager - Three.js manager
     * @param {number} scaleFactor - Scale factor for the screenshot  
     * @returns {Promise<Blob>} PNG blob of the current frame
     */
    async function captureScreenshot(threeManager, scaleFactor) {
        if (isCapturing) {
            console.warn('Screenshot capture already in progress');
            return null;
        }
        
        isCapturing = true;
        
        try {
            const blob = await new Promise((resolve, reject) => {
                try {
                    const { canvas, scene, renderer } = threeManager;
                    const { background } = scene;
                    const { width, height } = canvas;
                    // Set canvas to desired screenshot dimension
                    renderer.setSize(width * scaleFactor, height * scaleFactor);
                    // Make background transparent
                    scene.background = null;
                    // Force render before taking the screenshot
                    threeManager.renderFrame();
                    // Get the data URL from canvas (simplest method for WebGPU)
                    const dataUrl = canvas.toDataURL('image/png');
                    scene.background = background;
                    renderer.setSize(width, height);
                    threeManager.renderFrame();
                    
                    // Convert data URL to blob
                    fetch(dataUrl)
                        .then(res => res.blob())
                        .then(resolve)
                        .catch(reject);
                } catch (error) {
                    reject(error);
                }
            });
            
            return blob;
            
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            throw error;
        } finally {
            isCapturing = false;
        }
    }
    
    /**
     * Captures a screenshot and triggers download.
     * Combines capture, conversion, and download in one call.
     * 
     * @param {WebGPURenderer} threeManager - Three.js manager
     * @param {number} scaleFactor - Scale factor for the screenshot  
     * @returns {Promise<boolean>} True if screenshot was successful
     */
    async function captureAndDownload(threeManager, scaleFactor) {
        try {
            const filename = getScreenshotFilename();
            const blob = await captureScreenshot(threeManager, scaleFactor);
            
            if (blob) {
                downloadScreenshot(blob, filename);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Failed to capture and download screenshot:', error);
            return false;
        }
    }
    
    /**
     * Checks if a screenshot capture is currently in progress.
     * @returns {boolean} True if capturing, false otherwise
     */
    function getIsCapturing() {
        return isCapturing;
    }
    
    // Public API
    return {
        createScreenshotManager,
        captureScreenshot,
        captureAndDownload,
        downloadScreenshot,
        getScreenshotFilename,
        getIsCapturing
    };
}

// Default export for convenience
export default createScreenshotManager;
