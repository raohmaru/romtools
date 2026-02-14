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
 * @param {Object} state - Camera state object
 * @param {THREE.Camera} threeCamera - Three.js camera
 */
export function setCameraPosition(state, threeCamera) {
    const [x, y, z] = getCameraPosition(state);
    threeCamera.position.set(x, y, z);
    if (state.fov) {
        threeCamera.setFocalLength(state.fov);
    }
}

/**
 * Sets the camera state from a serialized object.
 * @param {Object} state - Camera state object
 * @param {Object} newState - Camera state object
 */
export function setCameraState(state, newState) {
    if (newState.radius !== undefined) state.radius = newState.radius;
    if (newState.theta !== undefined) state.theta = newState.theta;
    if (newState.phi !== undefined) state.phi = newState.phi;
    if (newState.fov !== undefined) state.fov = newState.fov;
    if (newState.target !== undefined) state.target = [...newState.target];
    
    // Clamp values
    state.radius = Math.max(state.minRadius, Math.min(state.maxRadius, state.radius));
    state.phi = Math.max(state.minPhi, Math.min(state.maxPhi, state.phi));
}
