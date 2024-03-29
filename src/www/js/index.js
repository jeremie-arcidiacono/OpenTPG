'use strict';

window.addEventListener('load', onLoad);

function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

// Cordova is ready at this point
function onDeviceReady() {
    document.addEventListener('resume', onResume, false);

    Config.initConfig();

    if (!networkIsAvailable()) {
        console.warn("No internet connection available. The app can't be launched.")
        alert('Connexion internet non disponible. Veuillez vérifier votre connexion et relancer l\'application.');
    } else {
        document.addEventListener("offline", () => {
            alert('Connexion internet non disponible. Veuillez vous reconnecter pour utiliser l\'application.');
        }, false);

        if (LocalData.isLocalStorageAvailable()) {
            // Before displaying the real data, we try to send a random request to the API to check if the data is available
            isRemoteDataAvailable(() => {
                // All is OK and ready, we can launch the app
                console.log("App ready. Loading display...")
                SetDisplay();
                ScheduleDisplay();
            });

            // In background, run the update of the local storage data.
            updateLocalStorage(() => {
            });
        } else {
            // First time the app is launched, we need to download the data BEFORE displaying the app
            updateLocalStorage(() => {
                isRemoteDataAvailable(() => {
                    // All is OK and ready, we can launch the app
                    console.log("App ready. Loading display...");
                    SetDisplay();
                    ScheduleDisplay();
                })
            });
        }
    }
}

function updateLocalStorage(successCallback) {
    LocalData.updateLocalStorage()
        .then(hasUpdated => {
            if (hasUpdated) {
                console.log("The verification of the local storage update is finished. The new version has been updated successfully.");
            } else {
                console.log("The verification of the local storage update is finished. The local storage was already up-to-date.");
            }
            successCallback();
        })
        .catch(error => {
            console.warn("Error while updating the local storage: " + error);
            alert('Erreur lors de la mise à jour du cache local. Vérifiez votre connexion internet.');
        });
}

function isRemoteDataAvailable(successCallback) {
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
                        successCallback();
                    }
                );
        });
}


function onResume() {
    if (!networkIsAvailable()) {
        alert('Connexion internet non disponible. Veuillez vous reconnecter pour utiliser l\'application.');
    }
}


/**
 * Check if the network is available.
 * @returns {boolean}
 */
function networkIsAvailable() {
    return navigator.connection.type !== 'none';
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
