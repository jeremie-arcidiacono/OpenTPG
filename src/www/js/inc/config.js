"use strict";

/**
 * Authors : Grégoire Péan & Jérémie Arcidiacono
 * Date : January - March 2023
 * Description : Class Config
 */


/**
 * Class used to manage a list of config parameters which can be changed by the user.
 * The config data is stored in the localStorage.
 */
class Config {
    static CONFIG_KEY = "config";

    static DEFAULT_CONFIG = {
        "nbBusByProximity": 5,
        "maxArrivalTime": 60,
        "nbConnections": 6,
    }

    /**
     * Initialize the config
     * If the config is not in the localStorage, create it.
     * @return {void}
     */
    static initConfig() {
        // Check if the config is already in the localStorage
        let config = localStorage.getItem(this.CONFIG_KEY);
        if (config === null) {
            // Create the default config
            localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.DEFAULT_CONFIG));
        }
    }

    /**
     * Get a config value
     * @param {string} key
     * @param {string|number|boolean|null} defaultValue The default value to return if the key doesn't exist
     * @return {string|number|boolean|null}
     */
    static get(key, defaultValue = null) {
        let config = JSON.parse(localStorage.getItem(this.CONFIG_KEY));

        if (config[key] === undefined) {
            console.warn("The key " + key + " doesn't exist in the config");
            return defaultValue;
        }

        return config[key];
    }

    /**
     * Set a config value
     * @param {string} key The key must exist in the DEFAULT_CONFIG (you can't add a new key)
     * @param {string|number|boolean|null} value The value to set (must be the same type as the default value)
     * @return {boolean} True if the value has been set, false otherwise
     */
    static set(key, value) {
        // Check if the key exists
        if (this.DEFAULT_CONFIG[key] === undefined) {
            return false;
        }

        // Check if the value is valid
        if (typeof value !== typeof this.DEFAULT_CONFIG[key]) {
            return false;
        }

        // Set the value
        let actualConfig = JSON.parse(localStorage.getItem(this.CONFIG_KEY));
        actualConfig[key] = value;
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(actualConfig));

        return true;
    }
}
