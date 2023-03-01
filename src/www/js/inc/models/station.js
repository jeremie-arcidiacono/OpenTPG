"use strict";

class Station {
    id;
    name;
    lines;
    isFavorite;

    /**
     *
     * @param {string} id The id of the station
     * @param {string} name The name of the station
     * @param {string[]|null} lines Array of string representing the lines number (null if unknown)
     * @param {boolean} isFavorite True if the user has marked the station as favorite
     */
    constructor(id, name, lines = null, isFavorite = false) {
        this.id = id;
        this.name = name;
        this.lines = lines;
        this.isFavorite = isFavorite;
    }

    /**
     * Get the name of the station without the region
     * Example: "Genève, Gare Cornavin" => "Gare Cornavin"
     * @return {string}
     */
    getShortName() {

        if (this.name.includes(',')) {
            return this.name.split(',')[1];
        }
        return this.name;
    }
}
