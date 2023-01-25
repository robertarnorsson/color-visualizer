function hexToRgb(hex) {
    function convhexToRgb(hex) {
        // Parse the hexadecimal color code
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
        // If the color code is invalid, return null
        if(!result) {
            console.log("No Result!");
            return null;
        }
        // Otherwise, return the RGB value as an array of numbers
        return [            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ];
    }

    function makeRgbString(hex) {
        let rgb = convhexToRgb(hex);
        if(!rgb) {
            console.log("Invalid color code!");
            return null;
        }
        return rgb[0]+", "+rgb[1]+", "+rgb[2]
    }

    return makeRgbString(hex)
}

module.exports = hexToRgb;