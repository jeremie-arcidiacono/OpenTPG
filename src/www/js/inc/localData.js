"use strict";

const REMOTE_STATIONS_FILE_URL = 'https://raw.githubusercontent.com/jeremie-arcidiacono/OpenTPG/main/tpg-data/stations.json';

class LocalData {

    /**
     * @param {string} name
     * @return {Promise<Station>}
     */
    getStationByName(name) {
        return new Promise((resolve, reject) => {
            let stations = JSON.parse(localStorage.getItem('stations'))["stations"];

            // Convert the stations object to an array
            let stationsArray = Object.keys(stations).map(function (key) {
                return [key, stations[key]];
            });

            let station = stationsArray.find(station => station[1].name === name);

            if (station !== null) {
                resolve(new Station(station[0], station[1].name, station[1].lines));
            } else {
                reject('Station not found');
            }
        });
    }

    updateStationStorage() {
        return new Promise((resolve, reject) => {

            // Get the remote file
            fetch(REMOTE_STATIONS_FILE_URL)
                .then(response => response.json())
                .then(remoteData => {
                    if (localStorage.getItem('stations') !== null) {
                        let localDate = JSON.parse(localStorage.getItem('stations'))["date"];
                        let remoteDate = remoteData["date"];

                        // If the local data is older than the remote data, update the local data
                        if (localDate < remoteDate) {
                            // Save the data in the local storage
                            localStorage.setItem('stations', JSON.stringify(remoteData));
                        }
                    } else {
                        // Save the data in the local storage
                        localStorage.setItem('stations', JSON.stringify(remoteData));
                    }
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });

        });
    }
}
