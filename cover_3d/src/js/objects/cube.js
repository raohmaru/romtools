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
 * Creates a cube mesh using Three.js BoxGeometry.
 * @param {THREE.Scene} scene - Three.js scene to add the cube to
 * @returns {Object} Object containing the cube mesh
 */
export function createCube(scene) {
    // Create geometry with 6 materials (one for each face)
    const geometry = new THREE.BoxGeometry(CUBE_WIDTH, CUBE_HEIGHT, CUBE_DEPTH);
    
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
    if (!cube || !cube.material || faceIndex < 0 || faceIndex > 5) return;
    
    // Create a new material with the texture
    const material = cube.material[faceIndex];
    material.map = texture;
    material.needsUpdate = true;
}