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
    'left': {
        name: 'Left side view',
        config: {
            version: CONFIG_VERSION,
            camera: {
                radius: 4.631368393546749,
                theta: 0.7778553248224369,
                phi: 1.5364042509689584
            }
        }
    },
    'right': {
        name: 'Right side view',
        config: {
            version: CONFIG_VERSION,
            camera: {
                radius: 4.631368393546749,
                theta: -0.7778553248224369,
                phi: 1.5364042509689584
            }
        }
    },
    'top-left': {
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
    'top-right': {
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
    'bottom-left': {
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
    'bottom-right': {
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