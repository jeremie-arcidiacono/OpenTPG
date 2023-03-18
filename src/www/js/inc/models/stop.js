"use strict";

/**
 * Authors : Grégoire Péan & Jérémie Arcidiacono
 * Date : January - March 2023
 * Description : Class representing a passage of a bus at a station
 */


/**
 * Represent a passage of a bus at a station
 * @property {Station} station The station where the bus will stop
 * @property {Date} time The time when the bus will stop
 */
class Stop {
    station;
    time;

    /**
     *
     * @param {Station} station
     * @param {Date} time
     */
    constructor(station, time) {
        this.station = station;
        this.time = time;
    }

    /**
     * Get the minutes left before the bus arrive at the station
     * @return {number}
     */
    getMinutesLeft() {
        let now = new Date();
        let diff = this.time.getTime() - now.getTime();
        return Math.max(Math.floor(diff / 1000 / 60), 0);
    }
}
