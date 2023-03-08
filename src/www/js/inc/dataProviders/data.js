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

}
