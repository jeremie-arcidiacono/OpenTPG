"use strict";
/**
 * Authors : Grégoire Péan & Jérémie Arcidiacono
 * Date : January - March 2023
 * Description : Class Connection
 */


/**
 * Represent a list of journeys between two stations
 * @property {Journey[]} journeys The list of journeys
 */
class Connection {
    journeys;

    /**
     * @param {Journey[]} journeys
     */
    constructor(journeys) {
        this.journeys = journeys;
    }

    /**
     * Get the duration of the connection
     * @return {number} The duration in minutes
     */
    getDuration() {
        let duration = 0;
        for (let journey of this.journeys) {
            duration += journey.getDuration();
        }
        return duration;
    }

    /**
     * Get the departure
     * @return {Stop}
     */
    getDeparture() {
        return this.journeys[0].departure;
    }

    /**
     * Get the arrival
     * @return {Stop}
     */
    getArrival() {
        return this.journeys[this.journeys.length - 1].arrival;
    }

}
