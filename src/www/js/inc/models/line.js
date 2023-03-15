"use strict";
/**
 * Authors : Grégoire Péan & Jérémie Arcidiacono
 * Date : January - March 2023
 * Description : Class representing a line
 */


/**
 * Represent a line with a name (also called number) and a color (background and text)
 * @property {string} name The name of the line (Ex: "G_pl")
 * @property {string} backgroundColor The background color of the line (Ex: FFFFFF)
 * @property {string} textColor The text color of the line (Ex: 000000)
 */
class Line {
    name;
    backgroundColor;
    textColor;

    /**
     * @param {string} name
     * @param {string} backgroundColor The background color of the line (Ex: FFFFFF)
     * @param {string} textColor The text color of the line (Ex: 000000)
     */
    constructor(name, backgroundColor, textColor) {
        this.name = name;
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
    }

    /**
     * Get the name of the line properly formatted
     * @return {string} Ex: "G_pl" => "G+"
     */
    getFormattedName() {
        let newName = this.name;

        newName = newName.replace('_pl', '+');

        return newName;
    }

}
