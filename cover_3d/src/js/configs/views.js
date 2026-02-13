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
export const VIEWS = {
    'l': {
        name: 'Left side view',
        config: {
            camera: {
                radius: 5.850468947313968,
                theta: -0.9853981633974483,
                phi: 1.5738195872579297
            }
        }
    },
    'r': {
        name: 'Right side view',
        config: {
            camera: {
                radius: 5.850468947313968,
                theta: -2.1513558925213587,
                phi: 1.5738195872579297
            }
        }
    },
    'tl': {
        name: 'Top-left view',
        config: {
            camera: {
                radius: 5.850468947313981,
                theta: -0.9633981477043863,
                phi: 1.3244868817320397
            }
        }
    },
    'tr': {
        name: 'Top-right view',
        config: {
            camera: {
                radius: 5.850468947313981,
                theta: -2.1513558925213587,
                phi: 1.3244868817320397
            }
        }
    },
    'bl': {
        name: 'Bottom-left view',
        config: {
            camera: {
                radius: 5.850468947313991,
                theta: -0.8619797958441361,
                phi: 1.7644859871064902
            }
        }
    },
    'br': {
        name: 'Bottom-right view',
        config: {
            camera: {
                radius: 5.850468947313991,
                theta: -2.2513558925213587,
                phi: 1.7644859871064902
            }
        }
    }
};