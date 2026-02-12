/**
 * Cube Geometry Module
 *
 * Uses Three.js BoxGeometry for cube mesh creation.
 * Each face can have its own material for texture mapping.
 */

import * as THREE from 'three';

// Cube dimensions
const CUBE_WIDTH = 2;
const CUBE_HEIGHT = 2.5;
const CUBE_DEPTH = 0.5;

// Face index mapping (Three.js BoxGeometry uses different order)
export const FACE_INDEX_MAP = { left: 0, right: 1, top: 2, bottom: 3, back: 4, front: 5 };
export const FACE_NAME_MAP = Object.keys(FACE_INDEX_MAP);

// Default materials for each face
const materials = [];

let highlightedFace = -1;
let lightMapTexture;

/**
 * Create geometry with 6 materials (one for each face)
 * @param {number} width
 * @param {number} height
 * @param {number} depth
 * @returns
 */
function createGeometry(width = CUBE_WIDTH, height = CUBE_HEIGHT, depth = CUBE_DEPTH) {
    const geometry = new THREE.BoxGeometry(width, height, depth);

    // Fix UV mapping to prevent texture flipping
    const uvAttribute = geometry.attributes.uv;
    for (let i = 0; i < uvAttribute.count; i++) {
        // Flip Y coordinate for all UVs
        uvAttribute.setY(i, 1 - uvAttribute.getY(i));
    }
    // Trigger geometry update
    geometry.attributes.uv.needsUpdate = true;

    return geometry;
}

/**
 * Creates a light map texture for mouse hover effects.
 * @returns {THREE.Texture} Light map texture
 */
function createLightMapTexture() {
    const canvas = new OffscreenCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e94560';
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.LinearSRGBColorSpace;
    return texture;
}

/**
 * Creates a cube mesh using Three.js BoxGeometry.
 * @param {THREE.Scene} scene - Three.js scene to add the cube to
 * @returns {Object} Object containing the cube mesh
 */
export function createCube(scene) {
    const geometry = createGeometry();

    // Create materials for each face
    materials.push( new THREE.MeshBasicMaterial({ color: 0x444444 }) ); // left
    materials.push( new THREE.MeshBasicMaterial({ color: 0x444444 }) ); // right
    materials.push( new THREE.MeshBasicMaterial({ color: 0x666666 }) ); // top
    materials.push( new THREE.MeshBasicMaterial({ color: 0x333333 }) ); // bottom
    materials.push( new THREE.MeshBasicMaterial({ color: 0x555555 }) ); // back
    materials.push( new THREE.MeshBasicMaterial({ color: 0x555555 }) ); // front

    // Create mesh
    const cube = new THREE.Mesh(geometry, materials);
    cube.name = 'box';

    // Add to scene if provided
    if (scene) {
        scene.add(cube);
    }

    return {
        mesh: cube,
        geometry: geometry
    };
}

/**
 * Updates the texture for a specific face of the cube.
 * @param {THREE.Mesh} cube - The cube mesh
 * @param {number} faceIndex - Face index (0-5)
 * @param {THREE.Texture} texture - Texture to apply
 */
export function updateCubeFaceTexture(cube, faceIndex, texture) {
    if (!cube || !cube.material || faceIndex < 0 || faceIndex > 5) {
        return;
    }

    // Create a new material with the texture
    const material = cube.material[faceIndex];
    material.map = texture;
    material.needsUpdate = true;
    // Fix tone
    material.color.set(0xFFFFFF);
}

/**
 * Updates the color for a specific face of the cube.
 * @param {THREE.Mesh} cube - The cube mesh
 * @param {number} faceIndex - Face index (0-5)
 * @param {string|number} color - Color value (hex string or number)
 */
export function updateCubeFaceColor(cube, faceIndex, color) {
    if (!cube || !cube.material || faceIndex < 0 || faceIndex > 5) {
        return;
    }

    const material = cube.material[faceIndex];
    if (!material.map) {
        material.color.set(color);
    }
}

/**
 * Sets the dimensions of the cube geometry.
 * @param {THREE.Mesh} cube - The cube mesh
 * @param {Object} dimensions - Object with width, height, depth properties
 * @param {number} dimensions.width - Width of the cube (X axis)
 * @param {number} dimensions.height - Height of the cube (Y axis)
 * @param {number} dimensions.depth - Depth of the cube (Z axis)
 */
export function setCubeDimensions(cube, dimensions) {
    if (!cube || !dimensions) {
        return;
    }

    const { width, height, depth } = dimensions;
    // Dispose old geometry and create new one with updated dimensions
    cube.geometry.dispose();
    // Recreate the BoxGeometry with new dimensions
    const newGeometry = createGeometry(width, height, depth);
    // Replace the geometry
    cube.geometry = newGeometry;
}

/**
 * Sets the rotation of the cube.
 * @param {THREE.Mesh} cube 
 * @param {Array} rotation 
 * @returns 
 */
export function setCubeRotation(cube, rotation) {
    if (!cube || !rotation) {
        return;
    }
    cube.rotation.fromArray(rotation);
}

/**
 * Highlights the given face of the cube
 * @param {THREE.Mesh} cube - The cube mesh
 * @param {number} faceIndex - Face index (0-5)
 */
export function highlightCubeFace(cube, faceIndex = -1) {
    if (!cube || !cube.material || faceIndex < -1 || faceIndex > 5 || faceIndex === highlightedFace) {
        return false;
    }

    // Lightmap texture for mouse hover effect
    if (!lightMapTexture) {
        lightMapTexture = createLightMapTexture();
        cube.material.forEach((m) => m.lightMapIntensity = 4);
    }

    // Reset previously hovered face
    if (highlightedFace > -1) {
        const prevMaterial = cube.material[highlightedFace];
        prevMaterial.lightMap = null;
        prevMaterial.needsUpdate = true;
    }

    // Highlight hovered face
    if (faceIndex > -1) {
        const material = cube.material[faceIndex];
        material.lightMap = lightMapTexture;
        material.needsUpdate = true;
    }

    highlightedFace = faceIndex;
    cube.highlightedFace = faceIndex;

    return true;
}

/**
 * Returns the name of the cube face based on the given index
 * @param {number} faceIndex 
 * @returns {string|undefined}
 */
export function getCubeFaceName(faceIndex) {
    return FACE_NAME_MAP[faceIndex];
}

/**
 * Removes the texture from a specific face of the cube, reverting it to its default material color.
 * @param {THREE.Mesh} cube - The cube mesh
 * @param {number} faceIndex - Face index (0-5)
 * @param {string|number|undefined} color - Color value (hex string or number)
 * @returns 
 */
export function removeCubeFaceTexture(cube, faceIndex, color) {
    if (!cube || faceIndex < 0 || faceIndex > 5) {
        return;
    }

    // Create a new material with the texture
    const material = cube.material[faceIndex];
    const defaultMaterial = materials[faceIndex];
    material.map = null;
    material.color.set(color);
    material.needsUpdate = true;
}