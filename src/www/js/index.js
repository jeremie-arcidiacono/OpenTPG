function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
}

// Cordova is ready at this point
function onDeviceReady() {
    document.addEventListener('resume', onResume, false);

    ensureNetworkAvailability();
}


function onResume() {
    ensureNetworkAvailability();
}


/*
 * Check if the network is available.
 * If not, display an alert.
*/
function ensureNetworkAvailability() {
    if (navigator.connection.type == Connection.NONE) {
        alert('No network connection');
    }
}
