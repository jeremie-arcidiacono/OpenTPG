"use strict";

/**
 * Represent a passage of a bus at a station
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
}
