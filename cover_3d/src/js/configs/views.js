/**
 * Predefined Configuration Templates
 * 
 * Contains example camera and layout configurations for quick setup.
 */

// Configuration version for compatibility
export const CONFIG_VERSION = '1.0';

/**
 * Predefined configurations dictionary
 */
export const CONFIGS = {
    'l': {
        name: 'Left side view',
        config: {
            version: CONFIG_VERSION,
            camera: {
                radius: 4.631368393546749,
                theta: 0.792941003573224,
                phi: 1.5592443670503562
            }
        }
    },
    'r': {
        name: 'Right side view',
        config: {
            version: CONFIG_VERSION,
            camera: {
                radius: 4.631368393546749,
                theta: -0.792941003573224,
                phi: 1.5592443670503562
            }
        }
    },
    'tl': {
        name: 'Top-left view',
        config: {
            version: CONFIG_VERSION,
            camera: {
                radius: 4.631368393546749,
                theta: 0.7552269194879576,
                phi: 1.174398244807168
            }
        }
    },
    'tr': {
        name: 'Top-right view',
        config: {
            version: CONFIG_VERSION,
            camera: {
                radius: 4.631368393546749,
                theta: -0.7552269194879576,
                phi: 1.174398244807168
            }
        }
    },
    'bl': {
        name: 'Bottom-left view',
        config: {
            version: CONFIG_VERSION,
            camera: {
                radius: 4.631368393546749,
                theta: 0.7476842574069325,
                phi: 1.8382147167154812
            }
        }
    },
    'br': {
        name: 'Bottom-right view',
        config: {
            version: CONFIG_VERSION,
            camera: {
                radius: 4.631368393546749,
                theta: -0.7476842574069325,
                phi: 1.8382147167154812
            }
        }
    }
};