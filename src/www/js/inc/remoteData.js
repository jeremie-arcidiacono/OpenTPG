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
                        nextStop.push(new Stop(station,  new Date(bus.stop.prognosis.departure)));

                        bus.passList.forEach(stop => {
                            if (stop.station.name !== null){
                                let currentStation = null;
                                if (stop.station.id !== null){
                                    currentStation = LocalData.getStationById(stop.station.id)
                                }
                                else {
                                    currentStation = LocalData.getStationByName(stop.station.name)
                                }
                                let time = stop.prognosis.departure;
                                if (time === null){
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
}
