"use strict";

class Station {

    /**
     *
     * @param {string} id The id of the station
     * @param {string} name The name of the station
     * @param {string[]} lines Array of string representing the lines number
     * @param {boolean} isFavorite True if the user has marked the station as favorite
     */
    constructor(id, name, lines, isFavorite = false) {
        this.id = id;
        this.name = name;
        this.lines = lines;
        this.isFavorite = isFavorite;
    }
}
