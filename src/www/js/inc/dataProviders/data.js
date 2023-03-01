"use strict";

/**
 * This class is a facade for the LocalData and RemoteData classes
 * It will choose the best data provider (local or remote) for the request
 */
class Data {

    /**
     * Get a Station object from the localStorage or the API
     * @param {string} name
     * @return {Station|null} Null if the station is not found
     */
    static getStationByName(name){
        let station = LocalData.getStationByName(name);

        if(station === null){
            station = RemoteData.getStationByName(name);

            // Try to get the lines from the local storage
            let localStation = LocalData.getStationById(station.id);
            if (localStation !== null){
                station.lines = localStation.lines;
            }
        }

        return station;
    }

    /**
     * Get a Station object from the localStorage or the API
     * @param {string} id
     * @return {Station|null} Null if the station is not found
     */
    static getStationById(id){
        let station = LocalData.getStationById(id);

        if(station === null){
            station = RemoteData.getStationById(id);
            // The station is not in the local storage, so we can't get the lines
        }

        return station;
    }

    /**
     * Get the next buses for a station
     * @param {Station} station
     * @param {number} limit
     * @return {Promise<Bus[]>}
     */
    static getStationboard(station, limit = 32){
        return RemoteData.getStationboard(station, limit);
    }

}
