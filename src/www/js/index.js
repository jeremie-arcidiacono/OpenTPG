'use strict';

window.addEventListener('load', onLoad);

function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

// Cordova is ready at this point
function onDeviceReady() {
    document.addEventListener('resume', onResume, false);

    if (!networkIsAvailable()) {
        alert('Connexion internet non disponible. Veuillez vérifier votre connexion.');
    } else {
        // Before displaying the real data, we try to send a random request to the API to check if the data is available
        Data.getStationById('8592978') // Station Chemin du Bac
            .catch(error => {
                alert('Impossible de recevoir les données en temps réel. Veuillez réessayer plus tard.');
            })
            .then((station) => {
                RemoteData.getStationboard(station)
                    .catch(error => {
                        alert('Impossible de recevoir les données en temps réel. Veuillez réessayer plus tard.');
                    })
                    .then(() => {
                            // All is OK and ready, we can launch the app
                            SetDisplay();
                            ScheduleDisplay();
                        }
                    );
            });


        LocalData.updateLocalStorage()
            .catch(error => {
                alert('Erreur lors de la mise à jour du cache local. Vérifiez votre connexion internet.');
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
 * @returns {boolean}
 */
function networkIsAvailable() {
    return navigator.connection.type !== Connection.NONE;
}

/**
 * Check if the geolocation is available.
 * @return {Promise<void>} Resolve if it's available
 */
function gpsIsAvailable() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            maximumAge: 15000,
            timeout: 3000,
            enableHighAccuracy: false
        });
    })
}
