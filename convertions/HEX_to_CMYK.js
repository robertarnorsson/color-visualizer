function hexToCmyk(hex) {

    function convhexToCmyk(hex) {
        // Parse the hexadecimal color code
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
        // If the color code is invalid, return null
        if (!result) return null;
    
        // Otherwise, return the RGB value as an array of numbers
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ];
    }

    function floatToInt(x) {
        return (x < 0 ? Math.ceil(x) : Math.floor(x));
    }

    function rgbToCmyk(r, g, b) {
        var c = 1 - (r / 255);
        var m = 1 - (g / 255);
        var y = 1 - (b / 255);
        
        var k = Math.min(c, m, y);
        
        if (k == 1) {
            return [0, 0, 0, 1];
        }
        
        c = (c - k) / (1 - k);
        m = (m - k) / (1 - k);
        y = (y - k) / (1 - k);

        c = c * 100;
        m = m * 100;
        y = y * 100;
        k = k * 100;

        c = floatToInt(c);
        m = floatToInt(m);
        y = floatToInt(y);
        k = floatToInt(k);
        
        return [c, m, y, k];
    }

    var r = convhexToCmyk(hex)[0];
    var g = convhexToCmyk(hex)[1];
    var b = convhexToCmyk(hex)[2];

    function makeCmykString(r, g ,b) {
        return rgbToCmyk(r, g, b)[0]+", "+rgbToCmyk(r, g, b)[1]+", "+rgbToCmyk(r, g, b)[2]+", "+rgbToCmyk(r, g, b)[3]
    }

    return makeCmykString(r, g, b)
}

module.exports = hexToCmyk;