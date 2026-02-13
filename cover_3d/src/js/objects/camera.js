/**
 * Camera Controller Module
 * 
 * Provides camera state management and helper functions for Three.js OrbitControls.
 */

/**
 * Default camera configuration.
 */
export const defaultCameraConfig = {
    radius: 7.348469228349535,
    theta: -0.7853981633974484,
    phi: 1.2951535275786312,
    fov: 50,
    target: [0, 0, 0],
    minRadius: 2,
    maxRadius: 30,
    minPhi: 0.1,
    maxPhi: Math.PI - 0.1,
    rotation: [0, 0, 0]
};

/**
 * Gets the camera position from spherical coordinates.
 * @param {Object} camera - Camera state object
 * @returns {Array<number>} Camera position [x, y, z]
 */
export function getCameraPosition(camera) {
    const x = camera.radius * Math.sin(camera.phi) * Math.cos(camera.theta);
    const y = camera.radius * Math.cos(camera.phi);
    const z = camera.radius * Math.sin(camera.phi) * Math.sin(camera.theta);
    return [x, y, z];
}

/**
 * Sets the camera position from spherical coordinates.
 * @param {Object} camera - Camera state object
 * @param {THREE.Camera} threeCamera - Three.js camera
 */
export function setCameraPosition(camera, threeCamera) {
    const [x, y, z] = getCameraPosition(camera);
    threeCamera.position.set(x, y, z);
    if (camera.fov) {
        threeCamera.setFocalLength(camera.fov);
    }
}

/**
 * Sets the camera state from a serialized object.
 * @param {Object} camera - Camera state object
 * @param {Object} state - Camera state object
 */
export function setCameraState(camera, state) {
    if (state.radius !== undefined) camera.radius = state.radius;
    if (state.theta !== undefined) camera.theta = state.theta;
    if (state.phi !== undefined) camera.phi = state.phi;
    if (state.fov !== undefined) camera.fov = state.fov;
    if (state.target !== undefined) camera.target = [...state.target];
    
    // Clamp values
    camera.radius = Math.max(camera.minRadius, Math.min(camera.maxRadius, camera.radius));
    camera.phi = Math.max(camera.minPhi, Math.min(camera.maxPhi, camera.phi));
}
