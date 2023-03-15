"use strict";
/**
 * Authors : Grégoire Péan & Jérémie Arcidiacono
 * Date : January - March 2023
 * Description : Class representing a vehicle
 */


/**
 * Represent a vehicle with the station where it will stop next (until the terminal)
 * @property {Line} line The line of the bus
 * @property {Stop[]} nextStops Array of Stop objects
 */
class Bus {
    line;
    nextStops;

    /**
     * @param {Line} line
     * @param {Stop[]} nextStop
     */
    constructor(line, nextStop) {
        this.line = line;
        this.nextStops = nextStop;
    }

    /**
     * Get the final destination of the bus
     * @return {Station}
     */
    getTerminal() {
        return this.nextStops[this.nextStops.length - 1].station;
    }

    /**
     * Get the next station where the bus will stop
     * @return {Stop}
     */
    getNearestStop() {
        return this.nextStops[0];
    }
}
