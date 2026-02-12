import { parseDOMString } from 'rtkjs/dom.js';

/**
 * Message Notification Component
 * 
 * Creates and manages toast-style notification messages.
 */

/**
 * Message class for displaying notifications
 */
export class Message {
    /**
     * Create a new Message instance
     * @param {HTMLElement} container 
     * @param {*} options 
     */
    constructor(container, options = {}) {
        this.options = {
            duration: options.duration || 4000,
            maxMessages: options.maxMessages || 5,
            ...options
        };
        this.singleInstances = new Map();
        this.create(container);
    }

    /**
     * Create the zoom indicator element
     * @param {HTMLElement} container 
     * @returns {HTMLElement} The zoom indicator element
     */
    create(container) {
        // Create indicator element
        this.container = parseDOMString('<div id="message-container"></div>');

        // Append to container
        if (container) {
            container.appendChild(this.container);
        }
    }

    /**
     * Show a message notification
     * @param {string} text - The message text
     * @param {string} type - Message type: 'info', 'success', 'error'
     * @param {boolean} single - Whether to only show one instance of this message text
     */
    show(text, type = 'info', single = false) {
        if (!this.container || (single && this.singleInstances.has(text))) {
            return;
        }

        const message = parseDOMString(`<div class="message ${type}">${text}</div>`);
        this.container.appendChild(message);

        // Limit number of messages
        const messages = this.container.querySelectorAll('.message');
        if (messages.length > this.options.maxMessages) {
            messages[0].remove();
        }

        if (single) {
            this.singleInstances.set(text, true);
        }

        // Auto-remove after duration
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            message.addEventListener("animationend", () => {
                message.remove();
                this.singleInstances.delete(text);
            });
        }, this.options.duration);
    }

    /**
     * Show an info message
     * @param {string} text - The message text
     * @param {boolean} single - Whether to only show one instance of this message text
     */
    info(text, single) {
        this.show(text, 'info', single);
    }

    /**
     * Show a success message
     * @param {string} text - The message text
     */
    success(text) {
        this.show(text, 'success');
    }

    /**
     * Show an error message
     * @param {string} text - The message text
     */
    error(text) {
        this.show(text, 'error');
    }

    /**
     * Clear all messages
     */
    clear() {
        if (!this.container) {
            return;
        }
        this.container.innerHTML = '';
    }
}