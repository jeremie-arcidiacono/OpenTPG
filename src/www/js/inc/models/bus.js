"use strict";

/**
 * Represent a bus with the station where it will stop next (until the terminal)
 */
class Bus {
    line;
    nextStop;

    /**
     * @param {string} line
     * @param {Stop[]} nextStop
     */
    constructor(line, nextStop) {
        this.line = line;
        this.nextStop = nextStop;
    }

    /**
     * Get the final destination of the bus
     * @return {Station}
     */
    getTerminal() {
        return this.nextStop[this.nextStop.length - 1].station;
    }
}
