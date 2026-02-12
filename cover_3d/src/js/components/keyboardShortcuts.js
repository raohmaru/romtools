/**
 * Keyboard Shortcuts Handler
 * 
 * Manages keyboard shortcuts for the application.
 */

/**
 * Default keyboard shortcut mappings
 */
export const KEYBOARD_SHORTCUTS = {
    's': { action: 'save', description: 'Save configuration' },
    'l': { action: 'load', description: 'Load configuration' },
    'p': { action: 'screenshot', description: 'Take screenshot' },
    'r': { action: 'reset', description: 'Reset camera' },
    'a': { action: 'advanced', description: 'Advanced options' },
    '?': { action: 'help', description: 'Show this help' }
};

/**
 * KeyboardShortcuts class for managing keyboard shortcuts
 */
export class KeyboardShortcuts {
    constructor(options = {}) {
        this.shortcuts = options.shortcuts || KEYBOARD_SHORTCUTS;
        this.handler = options.handler || null;
        this.isActive = true;
    }

    /**
     * Set the handler function for shortcut actions
     * @param {Function} handler - Function to call when a shortcut is triggered
     */
    setHandler(handler) {
        this.handler = handler;
    }

    /**
     * Handle keydown event
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleEvent(event) {
        if (!this.isActive) {
            return;
        }

        // Ignore if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = event.key.toLowerCase();
        const shortcut = this.shortcuts[key];

        if (shortcut) {
            event.preventDefault();
            if (this.handler) {
                this.handler(shortcut.action);
            }
        }
    }

    /**
     * Attach event listeners
     * @param {EventTarget} target - The target to attach listeners to
     */
    attach(target = document) {
        target.addEventListener('keydown', this);
    }
}