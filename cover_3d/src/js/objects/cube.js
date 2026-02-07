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
 * Creates a cube mesh using Three.js BoxGeometry.
 * @param {THREE.Scene} scene - Three.js scene to add the cube to
 * @returns {Object} Object containing the cube mesh
 */
export function createCube(scene) {
    const geometry = createGeometry();

    // Create materials for each face
    // Order: right, left, top, bottom, front, back
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0x444444 }), // right
        new THREE.MeshBasicMaterial({ color: 0x444444 }), // left
        new THREE.MeshBasicMaterial({ color: 0x666666 }), // top
        new THREE.MeshBasicMaterial({ color: 0x222222 }), // bottom
        new THREE.MeshBasicMaterial({ color: 0x555555 }), // front
        new THREE.MeshBasicMaterial({ color: 0x555555 }), // back
    ];

    // Don't apply renderer tone
    materials.forEach((material) => material.toneMapped = false);

    // Create mesh
    const cube = new THREE.Mesh(geometry, materials);
    cube.name = 'box';
    // Rotates 90º to the right
    cube.rotation.y += Math.PI / 2;

    // Add to scene if provided
    if (scene) {
        scene.add(cube);
    }

    return {
        mesh: cube,
        geometry: geometry,
        materials: materials
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
    // Apply renderer tone
    material.toneMapped = true;
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

    const { width = CUBE_WIDTH, height = CUBE_HEIGHT, depth = CUBE_DEPTH } = dimensions;
    // Dispose old geometry and create new one with updated dimensions
    cube.geometry.dispose();
    // Recreate the BoxGeometry with new dimensions
    const newGeometry = createGeometry(width, height, depth);
    // Replace the geometry
    cube.geometry = newGeometry;
}
