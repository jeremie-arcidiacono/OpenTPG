"use strict";
/**
 * Authors : Grégoire Péan & Jérémie Arcidiacono
 * Date : January - March 2023
 * Description : Class Journey
 */


/**
 * Represent a route between two stations (with only one line and no transfer)
 * @property {Stop} departure The departure station
 * @property {Stop} arrival The arrival station
 * @property {Line} line The line of the bus
 */
class Journey {
    departure;
    arrival;
    line;

    /**
     * @param {Stop} departure
     * @param {Stop} arrival
     * @param {Line} line
     */
    constructor(departure, arrival, line) {
        this.departure = departure;
        this.arrival = arrival;
        this.line = line;
    }

    /**
     * Get the duration of the journey
     * @return {number} The duration in minutes
     */
    getDuration() {
        let diff = this.arrival.time.getTime() - this.departure.time.getTime();
        return Math.floor(diff / 1000 / 60);
    }
}
