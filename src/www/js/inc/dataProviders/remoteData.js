"use strict";

const API_URL = 'https://transport.opendata.ch/v1/';

class RemoteData {

    /**
     * Get a list of bus which will stop at the station
     * @param {Station} station
     * @param {number} limit
     * @return {Promise<Bus[]>}
     */
    static getStationboard(station, limit = 32) {
        return new Promise((resolve, reject) => {
            fetch(API_URL + 'stationboard?id=' + station.id + '&limit=' + limit)
                .then(response => response.json())
                .then(data => {
                    let busList = [];
                    data.stationboard.forEach(bus => {
                        let nextStop = [];

                        let time = bus.stop.prognosis.departure;
                        if (time === null) {
                            time = bus.stop.departure;
                            if (bus.stop.delay !== null) {
                                time = time.getTime() + bus.stop.delay * 1000
                            }
                        }
                        nextStop.push(new Stop(station, new Date(time)));

                        bus.passList.forEach(stop => {
                            if (stop.station.name !== null) {
                                let currentStationPromise;
                                if (stop.station.id !== null) {
                                    currentStationPromise = Data.getStationById(stop.station.id)

                                } else {
                                    currentStationPromise = Data.getStationByName(stop.station.name)
                                }
                                currentStationPromise.then(currentStation => {
                                    let time = stop.prognosis.departure;
                                    if (time === null) {
                                        time = stop.prognosis.arrival;
                                    }
                                    nextStop.push(new Stop(currentStation, new Date(time)));
                                });
                            }
                        });
                        if (bus.number.startsWith('T ')) {
                            bus.number = bus.number.replace('T ', '');
                        }
                        busList.push(new Bus(bus.number, nextStop));
                    });
                    resolve(busList);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Get a Station object from the API.
     * @param {string} name The name (or part of the name) of the station
     * @return {Promise<Station>} The station found or reject the promise if the station is not found
     */
    static getStationByName(name) {
        return new Promise((resolve, reject) => {
            fetch(API_URL + 'locations?query=' + name)
                .then(response => response.json())
                .then(data => {
                    data.stations.forEach(currentStation => {
                        if (currentStation.id !== null) {
                            resolve(new Station(currentStation.id, currentStation.name, null));
                        }
                    });

                    reject('Station not found');
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Get a Station object from the API
     * @param {string} id
     * @return {Promise<Station>} The station found or reject the promise if the station is not found
     */
    static getStationById(id) {
        return new Promise((resolve, reject) => {
            fetch(API_URL + 'locations?id=' + id)
                .then(response => response.json())
                .then(data => {
                    data.stations.forEach(currentStation => {
                        if (currentStation.id !== null) {
                            resolve(new Station(currentStation.id, currentStation.name, null));
                        }
                    });

                    reject('Station not found');
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Get a list of the nearest stations
     * @param lat
     * @param long
     * @param limit The maximum number of stations to return
     * @return {Promise<Station[]>}
     */
    static getNearbyStations(lat, long, limit = 10) {
        return new Promise((resolve, reject) => {
            fetch(API_URL + 'locations?x=' + lat + '&y=' + long + '&type=station')
                .then(response => response.json())
                .then(data => {
                    let stationList = [];
                    data.stations.forEach(currentStation => {
                        if (currentStation.id !== null) {
                            Data.getStationById(currentStation.id).then(station => {
                                stationList.push(station);
                            });
                        }
                    });

                    if (stationList.length > limit) {
                        stationList = stationList.slice(0, limit);
                    }

                    resolve(stationList);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}
