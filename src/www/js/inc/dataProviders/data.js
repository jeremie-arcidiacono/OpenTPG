"use strict";

/**
 * This class is a facade for the LocalData and RemoteData classes
 * It will choose the best data provider (local or remote) for the request
 */
class Data {

    /**
     * Get a Station object from the localStorage or the API
     * @param {string} name
     * @return {Promise<Station>} The station found or reject the promise if the station is not found
     */
    static getStationByName(name) {
        return new Promise((resolve, reject) => {
            let station = LocalData.getStationByName(name);

            if (station === null) {
                // stop the execution of the function until the promise is resolved
                RemoteData.getStationByName(name)
                    .then(station => {
                        // Try to get the lines from the local storage
                        let localStation = LocalData.getStationById(station.id);
                        if (localStation !== null) {
                            station.lines = localStation.lines;
                        }
                        resolve(station);
                    })
                    .catch(error => {
                        reject(error);
                    });
            } else {
                resolve(station);
            }
        });
    }

    /**
     * Search a station by its name (or part of its name)
     * Only search in the local storage for performance reasons
     * @param {string} name The name (or part of the name) of the station
     * @param {number} limit The maximum number of results (default: 10)
     * @return {Station[]} The list of stations found (empty if none)
     */
    static getStationByPartialName(name, limit = 10) {
        return LocalData.getStationByPartialName(name, limit);
    }

    /**
     * Get a Station object from the localStorage or the API
     * @param {string} id
     * @return {Promise<Station>} The station found or reject the promise if the station is not found
     */
    static getStationById(id) {
        return new Promise((resolve, reject) => {
            let station = LocalData.getStationById(id);

            if (station === null) {
                RemoteData.getStationById(id)
                    .then(station => {
                        resolve(station);
                    })
                    .catch(error => {
                        reject(error);
                    });
            } else {
                resolve(station);
            }
        });
    }

    /**
     * Get a list of bus which will stop at the station
     * @param {Station} station
     * @param {number} limit
     * @return {Promise<Bus[]>}
     */
    static getStationboard(station, limit = 32) {
        return RemoteData.getStationboard(station, limit);
    }

    /**
     * Get a list of the nearest stations from the current position
     * @param {number} limit The maximum number of results (default: 10)
     * @return {Promise<Station[]>}
     */
    static getNearbyStations(limit = 10) {
        return new Promise((resolve, reject) => {
            // Get the current position
            navigator.geolocation.getCurrentPosition(
                position => {
                    // Get the list of nearby stations
                    RemoteData.getNearbyStations(position.coords.latitude, position.coords.longitude, limit)
                        .then(stations => {
                            resolve(stations);
                        })
                        .catch(error => {
                            reject(error);
                        });
                },
                error => {
                    reject(error);
                },
                {
                    maximumAge: 10000,
                    timeout: 5000,
                    enableHighAccuracy: false
                }
            );
        });
    }

    /**
     * Get the list of stations marked as favorite by the user
     * @return {Station[]}
     */
    static getFavoriteStations() {
        return LocalData.getFavoriteStations();
    }

}
