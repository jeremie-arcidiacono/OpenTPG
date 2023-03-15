"use strict";

class Station {
    id;
    name;
    lines; // Array of Line objects
    #isFavorite;

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
        this.#isFavorite = isFavorite;

        let arrLines = [];
        if (lines !== null && lines.length > 0) {
            for (let line of lines) {
                let lineObj = LocalData.getLineByName(line);
                if (lineObj !== null) {
                    arrLines.push(lineObj);
                }
                else {
                    console.warn("Line '" + line + "' not found in the local data");
                }
            }
        }
        this.lines = arrLines;
    }

    /**
     * Get the name of the station without the region
     * Example: "Genève, Gare Cornavin" => "Gare Cornavin"
     * @return {string}
     */
    getShortName() {
        let newName;
        if (this.name.includes(',')) {
            newName = this.name.split(',')[1];
        } else {
            newName = this.name;
        }

        newName = newName.trim();

        // Put the first letter in uppercase
        newName = newName.charAt(0).toUpperCase() + newName.slice(1);

        return newName;
    }

    /**
     * @return {boolean}
     */
    getIsFavorite() {
        return this.#isFavorite;
    }

    /**
     * Set the station as favorite or not (and update the local storage)
     * @param {boolean} isFavorite
     */
    setIsFavorite(isFavorite) {
        this.#isFavorite = isFavorite;

        // Update the local storage
        LocalData.setFavoriteStation(this.id, isFavorite);
    }
}
