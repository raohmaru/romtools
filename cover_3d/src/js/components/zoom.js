/**
 * Zoom class for managing zoom indicator UI
 */
export class Zoom {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            minRadius: options.minRadius || 3,
            maxRadius: options.maxRadius || 20
        };
        this.indicator = null;
        this.timeoutID = null;
        this.currentZoom = null;
        
        this.create();
    }

    /**
     * Create the zoom indicator element
     * @returns {HTMLElement} The zoom indicator element
     */
    create() {
        // Create indicator element
        this.indicator = document.createElement('div');
        this.indicator.id = 'zoom-indicator';
        this.indicator.className = 'zoom-indicator';
        this.indicator.textContent = 'Zoom: 0%';

        // Append to container
        if (this.container) {
            this.container.appendChild(this.indicator);
        }

        return this.indicator;
    }

    /**
     * Update the zoom indicator based on camera state
     * @param {Object} state - Camera state with radius, minRadius, maxRadius
     */
    update(state) {
        if (!this.indicator) {
            return;
        }

        const { radius, minRadius, maxRadius } = state;
        
        const zoomPercent = 100 - Math.round(
            ((radius - minRadius) / (maxRadius - minRadius)) * 100
        );
        if (zoomPercent === this.currentZoom) {
            return;
        }
        this.currentZoom = zoomPercent;

        this.indicator.textContent = `Zoom: ${zoomPercent}%`;
        this.indicator.className = 'zoom-indicator';
        // Reset animation
        this.indicator.style.animation = 'none';
        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => this.indicator.style.animation = null, 10);      

        // Visual feedback for zoom limits
        if (zoomPercent <= 0) {
            this.indicator.classList.add('at-min');
        } else if (zoomPercent >= 100) {
            this.indicator.classList.add('at-max');
        }
    }
}