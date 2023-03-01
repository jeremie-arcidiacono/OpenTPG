"use strict";

const API_URL = 'https://transport.opendata.ch/v1/';

class RemoteData {

    /**
     * @param {Station} station
     * @param {number} limit
     */
    static getStationboard(station, limit = 32) {
        return new Promise((resolve, reject) => {
            fetch(API_URL + 'stationboard?id=' + station.id + '&limit=' + limit)
                .then(response => response.json())
                .then(data => {
                    let busList = [];
                    data.stationboard.forEach(bus => {
                        let nextStop = [];
                        nextStop.push(new Stop(station, new Date(bus.stop.prognosis.departure)));

                        bus.passList.forEach(stop => {
                            if (stop.station.name !== null) {
                                let currentStation = null;
                                if (stop.station.id !== null) {
                                    currentStation = Data.getStationById(stop.station.id)
                                } else {
                                    currentStation = Data.getStationByName(stop.station.name)
                                }
                                let time = stop.prognosis.departure;
                                if (time === null) {
                                    time = stop.prognosis.arrival;
                                }
                                nextStop.push(new Stop(currentStation, new Date(time)));
                            }
                        });
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
     * Get a Station object from the API
     * @param {string} name The name (or part of the name) of the station
     * @return {Station|null}
     */
    static getStationByName(name) {

        fetch(API_URL + 'locations?query=' + name)
            .then(response => response.json())
            .then(data => {
                let station = null;
                data.stations.forEach(currentStation => {
                    if (station === null && currentStation.id !== null) {
                        station = new Station(currentStation.id, currentStation.name, null);
                    }
                });

                return (station);
            })
            .catch(error => {
                return null;
            });
    }

    /**
     * Get a Station object from the API
     * @param {string} id
     * @return {Station|null}
     */
    static getStationById(id) {
        fetch(API_URL + 'locations?query=' + id)
            .then(response => response.json())
            .then(data => {
                let station = null;
                data.stations.forEach(currentStation => {
                    if (station === null && currentStation.id !== null) {
                        station = new Station(currentStation.id, currentStation.name, null);
                    }
                });

                return (station);
            })
            .catch(error => {
                return null;
            });
    }
}
