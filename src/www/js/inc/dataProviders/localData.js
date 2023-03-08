"use strict";

const REMOTE_STATIONS_FILE_URL = 'https://raw.githubusercontent.com/jeremie-arcidiacono/OpenTPG/main/tpg-data/stations.json';

class LocalData {

    /**
     * Get a Station object from the local storage
     * @param {string} name The exact name of the station
     * @return {Station|null}
     */
    static getStationByName(name) {
        name = name.toLowerCase();

        let stations = JSON.parse(localStorage.getItem('stations'))["stations"];

        // Convert the stations object to an array
        let stationsArray = Object.keys(stations).map(function (key) {
            return [key, stations[key]];
        });

        let station = stationsArray.find(station => station[1].name.toLowerCase() === name);

        if (station !== null && station !== undefined) {
            return new Station(station[0], station[1].name, station[1].lines);
        }
        return null;
    }

    /**
     * Get a Station object from the local storage
     * @param {string} id
     * @return {Station|null}
     */
    static getStationById(id) {
        let stations = JSON.parse(localStorage.getItem('stations'))["stations"];

        if (stations[id] !== null && stations[id] !== undefined) {
            return new Station(id, stations[id].name, stations[id].lines);
        } else {
            return null;
        }
    }

    /**
     * Put the stations data from a remote location.
     * If the local data is older than the remote data, update the local data.
     * @return {Promise<boolean>} True if the data has been updated
     */
    static updateStationStorage() {
        return new Promise((resolve, reject) => {
            // Get the remote file
            fetch(REMOTE_STATIONS_FILE_URL)
                .then(response => response.json())
                .then(remoteData => {
                    if (localStorage.getItem('stations') !== null && localStorage.getItem('stations') !== undefined) {
                        let localDate = JSON.parse(localStorage.getItem('stations'))["date"];
                        let remoteDate = remoteData["date"];

                        // If the local data is older than the remote data, update the local data
                        if (localDate < remoteDate) {
                            // Save the data in the local storage
                            localStorage.setItem('stations', JSON.stringify(remoteData));
                            resolve(true);
                        }
                    } else {
                        // Save the data in the local storage
                        localStorage.setItem('stations', JSON.stringify(remoteData));
                        resolve(true);
                    }
                    resolve(false);
                })
                .catch(error => {
                    reject(error);
                });

        });
    }
}
