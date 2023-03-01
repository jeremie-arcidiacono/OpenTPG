import {LocalData} from './inc/localData.js';

window.addEventListener('load', onLoad);

function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

// Cordova is ready at this point
function onDeviceReady() {
    document.addEventListener('resume', onResume, false);

    let localData = new LocalData();

    if (!networkIsAvailable()) {
        alert('No network connection');
    } else {
        localData.updateStationStorage()
            .then(() => {

            })
            .catch(error => {
                // Error of the update of the local storage
            });
    }
}


function onResume() {
    if (!networkIsAvailable()) {
        alert('No network connection');
    }
}


/**
 * Check if the network is available.
 * If not, display an alert.
 * @returns {boolean}
 */
function networkIsAvailable() {
    return navigator.connection.type !== Connection.NONE;
}
