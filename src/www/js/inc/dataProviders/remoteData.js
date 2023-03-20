"use strict";
/**
 * Authors : Grégoire Péan & Jérémie Arcidiacono
 * Date : January - March 2023
 * Description : Class RemoteData
 */


const API_URL = 'https://transport.opendata.ch/v1/';

/**
 * This class is used to interact with the remote API (https://transport.opendata.ch/)
 */
class RemoteData {

    /**
     * Get a list of bus which will stop at the station
     * @param {Station} station
     * @param {number} limit The maximum number of bus to return
     * @return {Promise<Bus[]>}
     */
    static getStationboard(station, limit = 256) {
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

                        // We don't want to display bus which will arrive in more than {maxTimeLimit} minutes
                        if (new Date(time) - new Date() > Config.get("maxArrivalTime", 60) * 60 * 1000) {
                            return;
                        }

                        nextStop.push(new Stop(station, new Date(time)));

                        bus.passList.forEach(stop => {
                            if (stop.station.name !== null) {
                                let time = stop.prognosis.departure;
                                if (time === null) {
                                    time = stop.prognosis.arrival;
                                }

                                let currentStationPromise;
                                if (stop.station.id !== null) {
                                    currentStationPromise = Data.getStationById(stop.station.id)

                                } else {
                                    currentStationPromise = Data.getStationByName(stop.station.name)
                                }
                                currentStationPromise.then(currentStation => {
                                    nextStop.push(new Stop(currentStation, new Date(time)));
                                });
                            }
                        });

                        if (bus.number !== null) {
                            if (bus.number.startsWith('T ')) {
                                bus.number = bus.number.replace('T ', '');
                            }
                            let line = LocalData.getLineByName(bus.number);
                            if (line !== null){
                                busList.push(new Bus(line, nextStop));
                            }
                        } else {
                            // Sometimes the API doesn't return the bus number
                            // It's weird but the number can be found in the 'category' field (sometimes)
                            if (bus.category !== null) {
                                if (bus.category.startsWith('T ')) {
                                    bus.category = bus.category.replace('T ', '');
                                }
                                let line = LocalData.getLineByName(bus.category);
                                if (line !== null){
                                    busList.push(new Bus(line, nextStop));
                                }
                            }
                            // If the number is not found in the 'category' field, we ignore the bus
                        }
                    });

                    // Sort the bus list by the time when the bus will arrive at the station
                    busList.sort((a, b) => {
                        return a.nextStops[0].time.getTime() - b.nextStops[0].time.getTime();
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
        name = name.trim();
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
            fetch(API_URL + 'locations?query=' + id)
                .then(response => response.json())
                .then(data => {
                    data.stations.forEach(currentStation => {
                        if (currentStation.id !== null) {
                            resolve(new Station(currentStation.id, currentStation.name, null));
                        }
                    });

                    reject('Arrêt non trouvé');
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Get a list of the nearest stations
     * @param {number} lat
     * @param {number} long
     * @return {Promise<Station[]>}
     */
    static getNearbyStations(lat, long) {
        return new Promise((resolve, reject) => {
            fetch(API_URL + 'locations?x=' + lat + '&y=' + long + '&type=station')
                .then(response => response.json())
                .then(data => {
                    let stationList = [];
                    data.stations.forEach(currentStation => {
                        if (currentStation.id !== null) {
                            stationList.push(Data.getStationById(currentStation.id));
                        }
                    });

                    // We need to wait for all the promises to be resolved before continuing
                    Promise.all(stationList).then(stationList => {
                        if (stationList.length > Config.get('nbBusByProximity', 5)) {
                            stationList = stationList.slice(0, Config.get('nbBusByProximity', 5));
                        }

                        resolve(stationList);
                    })
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Get a list of connections (one or more journeys) between two stations
     * @param {Station} from
     * @param {Station} to
     * @param {Date} datetime
     * @param {boolean} isArrivalTime If true, the datetime parameter will be used as the arrival time
     * @return {Promise<Connection[]>}
     */
    static getConnections(from, to, datetime = new Date(), isArrivalTime = false) {
        return new Promise((resolve, reject) => {
            let date = datetime.toISOString().split('T')[0];
            let time = datetime.toISOString().split('T')[1].split('.')[0];
            fetch(API_URL + 'connections?from=' + from.id + '&to=' + to.id + '&date=' + date + '&time=' + time + '&isArrivalTime=' + isArrivalTime + '&limit=' + Config.get('maxConnections', 6))
                .then(response => response.json())
                .then(data => {
                    let connectionList = [];
                    let promises = []; // Create an array to hold all the promises

                    data.connections.forEach(connection => {
                        let journeyList = [];
                        connection.sections.forEach(section => {
                            let departureStationPromise = Data.getStationById(section.departure.station.id);
                            let arrivalStationPromise = Data.getStationById(section.arrival.station.id);

                            promises.push(Promise.all([departureStationPromise, arrivalStationPromise]).then(stations => {
                                let lineNumber = section.journey.number;

                                if (lineNumber.startsWith('T ')) {
                                    lineNumber = lineNumber.replace('T ', '');
                                }

                                journeyList.push(new Journey(
                                    new Stop(stations[0], new Date(section.departure.departure)),
                                    new Stop(stations[1], new Date(section.arrival.arrival)),
                                    LocalData.getLineByName(lineNumber)));
                            }));
                        });
                        connectionList.push(new Connection(journeyList));
                    });

                    // We need to wait for all the promises to be resolved before continuing
                    Promise.all(promises).then(() => {
                        resolve(connectionList);
                    });
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}
