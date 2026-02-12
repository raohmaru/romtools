import { parseDOMString } from 'rtkjs/dom.js';

/**
 * Loading Overlay Component
 * 
 * Creates and manages a full-screen loading overlay.
 */

/**
 * Loading class for managing loading states
 */
export class Loading {
    constructor(options = {}) {
        this.options = {
            text: options.text || 'Loading...',
            spinnerSize: options.spinnerSize || 48,
            ...options
        };
        this.overlay = null;
        this.spinner = null;
        this.textElement = null;
    }

    /**
     * Create and show the loading overlay
     */
    show() {
        if (this.overlay) {
            return;
        }

        this.overlay = parseDOMString(`
            <div id="loading-overlay">
                <div class="loading-spinner"></div>
                <p>${this.options.text}</p>
            </div>
        `);
        document.body.appendChild(this.overlay);
    }

    /**
     * Hide and remove the loading overlay
     */
    hide() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
            this.spinner = null;
            this.textElement = null;
        }
    }
}