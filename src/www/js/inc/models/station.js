"use strict";

/**
 * Authors : Grégoire Péan & Jérémie Arcidiacono
 * Date : January - March 2023
 * Description : Class representing a station
 */


/**
 * Represent a station with a name and a list of lines
 * @property {string} id The id of the station
 * @property {string} name The name of the station
 * @property {Line[]} lines Array of Line objects
 */
class Station {
    id;
    name;
    lines;
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
                if (line === null || line === "") {
                    continue;
                }

                // Try to find the line with exact name
                let lineObj = LocalData.getLineByName(line);
                if (lineObj !== null) {
                    arrLines.push(lineObj);
                } else {
                    // Try to find the line with alternative names

                    // 1. If the line name finish by "_p", we try to find the line with "_pl" instead
                    if (line.endsWith("_p")) {
                        line = line.replace("_p", "_pl");
                        lineObj = LocalData.getLineByName(line);
                        if (lineObj !== null) {
                            arrLines.push(lineObj);
                            continue;
                        }
                    }

                    // 2. If the line name finish by "_pl", we try to find the name without the "_pl"
                    if (line.endsWith("_pl")) {
                        line = line.replace("_pl", "");
                        lineObj = LocalData.getLineByName(line);
                        if (lineObj !== null) {
                            arrLines.push(lineObj);
                            continue;
                        }
                    }

                    // If after all the tests, the line is still not found, we display a warning
                    console.warn("Line '" + line + "' not found in the local data");
                }
            }
        }
        arrLines = arrLines.reverse();
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
