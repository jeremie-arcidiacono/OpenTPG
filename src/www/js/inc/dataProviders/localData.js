"use strict";
/**
 * Authors : Grégoire Péan & Jérémie Arcidiacono
 * Date : January - March 2023
 * Description : Class LocalData
 */


const REMOTE_STATIONS_FILE_URL = 'https://raw.githubusercontent.com/jeremie-arcidiacono/OpenTPG/main/tpg-data/stations.json';
const REMOTE_LINES_FILE_URL = 'https://raw.githubusercontent.com/jeremie-arcidiacono/OpenTPG/main/tpg-data/lines.json';

/**
 * This class is used to interact with the local storage
 */
class LocalData {

    /**
     * Get a Station object from the local storage
     * @param {string} name The exact name of the station
     * @return {Station|null}
     */
    static getStationByName(name) {
        if (!this.isLocalStorageAvailable()) {
            return null;
        }

        name = name.toLowerCase().trim();

        let stations = JSON.parse(localStorage.getItem('stations'))["stations"];

        let station = stations.find(station => station[1].name.toLowerCase() === name);

        if (station !== null && station !== undefined) {
            return new Station(station[0], station[1].name, station[1].lines, station[1].isFavorite);
        }
        return null;
    }

    /**
     * Search a station by its name (or part of its name)
     * @param {string} name The name (or part of the name) of the station
     * @param {number} limit The maximum number of results
     * @return {Station[]} The list of stations found (empty if none)
     */
    static getStationByPartialName(name, limit) {
        if (!this.isLocalStorageAvailable()) {
            console.log("Local storage is not available");
            return [];
        }

        name = name.toLowerCase().trim();

        let stations = JSON.parse(localStorage.getItem('stations'))["stations"];

        let stationsFound = stations.filter(station => station[1].name.toLowerCase().includes(name));

        if (stationsFound.length > limit) {
            stationsFound = stationsFound.slice(0, limit);
        }

        return stationsFound.map(station => new Station(station[0], station[1].name, station[1].lines, station[1].isFavorite));
    }

    /**
     * Get a Station object from the local storage
     * @param {string} id
     * @return {Station|null}
     */
    static getStationById(id) {
        if (!this.isLocalStorageAvailable()) {
            return null;
        }

        // If id is a number, convert it to a string
        id = id.toString();

        let stations = JSON.parse(localStorage.getItem('stations'))["stations"];

        let station = stations.find(station => station[0] === id);

        if (station !== null && station !== undefined) {
            return new Station(station[0], station[1].name, station[1].lines, station[1].isFavorite);
        }
        return null;
    }

    /** Get a Line object from the local storage
     * @param {string} name
     * @return {Line|null}
     */
    static getLineByName(name) {
        if (!this.isLocalStorageAvailable()) {
            return null;
        }

        name = name.toLowerCase().trim();

        let lines = JSON.parse(localStorage.getItem('lines'))["lines"];

        let line = lines.find(line => line[0].toLowerCase() === name);

        if (line !== null && line !== undefined) {
            let backgroundColor = line[1].split('~')[0];
            let textColor = line[1].split('~')[1];
            return new Line(line[0], backgroundColor, textColor);
        }
        return null;
    }

    /**
     * Put the stations data from a remote location.
     * If the local data is older than the remote data, update the local data.
     * @return {Promise<boolean>} True if the data has been updated
     */
    static updateLocalStorage() {
        let stationsPromise = new Promise((resolve, reject) => {
            // Get the remote file of stations
            fetch(REMOTE_STATIONS_FILE_URL)
                .then(response => response.json())
                .then(remoteData => {
                    if (localStorage.getItem('stations') !== null && localStorage.getItem('stations') !== undefined) {
                        let localDate = JSON.parse(localStorage.getItem('stations'))["date"];
                        let remoteDate = remoteData["date"];

                        // If the local data is older than the remote data, update the local data
                        if (localDate < remoteDate) {
                            remoteData["stations"] = Object.keys(remoteData["stations"]).map(function (key) {
                                return [key, remoteData["stations"][key]];
                            });

                            remoteData["stations"].forEach(station => {
                                station[1].isFavorite = false;
                            })

                            // Set the isFavorite property to keep that information even if the data is updated
                            LocalData.getFavoriteStations().forEach(station => {
                                remoteData["stations"].find(remoteStation => remoteStation[0] === station.id)[1].isFavorite = true;
                            });

                            // Save the data in the local storage
                            localStorage.setItem('stations', JSON.stringify(remoteData));
                            localStorage.setItem('lastUpdate', new Date().getTime());
                            resolve(true);
                        }
                    } else {
                        remoteData["stations"] = Object.keys(remoteData["stations"]).map(function (key) {
                            return [key, remoteData["stations"][key]];
                        });

                        // Set the isFavorite property to false for all the stations by default
                        remoteData["stations"].forEach(station => {
                            station[1].isFavorite = false;

                            // Set the station "Gare Cornavin" as favorite by default
                            if (station[0] === "8587057") {
                                station[1].isFavorite = true;
                            }
                        });

                        // Save the data in the local storage
                        localStorage.setItem('stations', JSON.stringify(remoteData));
                        localStorage.setItem('lastUpdate', new Date().getTime());
                        resolve(true);
                    }
                    resolve(false);
                })
                .catch(error => {
                    reject(false);
                });
        });

        let linesPromise = new Promise((resolve, reject) => {
            // Get the remote file of lines
            fetch(REMOTE_LINES_FILE_URL)
                .then(response => response.json())
                .then(remoteData => {
                    if (localStorage.getItem('lines') !== null && localStorage.getItem('lines') !== undefined) {
                        let localDate = JSON.parse(localStorage.getItem('lines'))["date"];
                        let remoteDate = remoteData["date"];

                        // If the local data is older than the remote data, update the local data
                        if (localDate < remoteDate) {
                            remoteData["lines"] = Object.keys(remoteData["lines"]).map(function (key) {
                                return [key, remoteData["lines"][key]];
                            });

                            // Save the data in the local storage
                            localStorage.setItem('lines', JSON.stringify(remoteData));
                            localStorage.setItem('lastUpdate', new Date().getTime());
                            resolve(true);
                        }
                    } else {
                        remoteData["lines"] = Object.keys(remoteData["lines"]).map(function (key) {
                            return [key, remoteData["lines"][key]];
                        });

                        localStorage.setItem('lines', JSON.stringify(remoteData));
                        localStorage.setItem('lastUpdate', new Date().getTime());
                        resolve(true);
                    }
                    resolve(false);
                })
                .catch(error => {
                    reject(false);
                });
        });

        return Promise.all([stationsPromise, linesPromise]).then(values => {
            return values[0] || values[1];
        });
    }

    /**
     * Get the list of stations marked as favorite by the user
     * @return {Station[]}
     */
    static getFavoriteStations() {
        if (!this.isLocalStorageAvailable()) {
            return [];
        }

        let stations = JSON.parse(localStorage.getItem('stations'))["stations"];

        let favoriteStations = stations.filter(station => station[1].isFavorite === true);

        return favoriteStations.map(station => new Station(station[0], station[1].name, station[1].lines, station[1].isFavorite));
    }

    /**
     * Set a station as favorite or not (in the local storage)
     * @param {string} stationId The id of the station
     * @param {boolean} isFavorite
     * @return {boolean} True if the station has been found and updated. False otherwise.
     */
    static setFavoriteStation(stationId, isFavorite) {
        if (!this.isLocalStorageAvailable()) {
            return false;
        }

        stationId = stationId.toString();

        let stations = JSON.parse(localStorage.getItem('stations'))["stations"];

        let stationIndex = stations.findIndex(station => station[0] === stationId);

        if (stationIndex === -1) {
            return false;
        }

        stations[stationIndex][1].isFavorite = isFavorite;

        localStorage.setItem('stations', JSON.stringify({
            "date": JSON.parse(localStorage.getItem('stations'))["date"],
            "stations": stations
        }));
        return true;
    }

    /**
     * Check if the local storage is available (not empty)
     * @return {boolean}
     */
    static isLocalStorageAvailable() {
        return localStorage.getItem('lastUpdate') !== null && localStorage.getItem('lastUpdate') !== undefined;
    }
}
