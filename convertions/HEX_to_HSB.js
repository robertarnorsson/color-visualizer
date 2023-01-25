function hexToHsb(hex) {
    function convhexToHsb(hex) {
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

    function rgbToHsb(r, g, b) {
        function RGBToHSB(r, g, b) {
            // Normalize RGB values
            r /= 255;
            g /= 255;
            b /= 255;
          
            // Find the maximum and minimum RGB values
            let max = Math.max(r, g, b);
            let min = Math.min(r, g, b);
          
            // Initialize HSB values
            let h, s, v = max;
          
            // Calculate Saturation
            let d = max - min;
            s = max == 0 ? 0 : d / max;
          
            // Calculate Hue
            if (max == min) {
              h = 0; // No color, it's a shade of gray
            } else {
              switch (max) {
                case r:
                  h = (g - b) / d + (g < b ? 6 : 0);
                  break;
                case g:
                  h = (b - r) / d + 2;
                  break;
                case b:
                  h = (r - g) / d + 4;
                  break;
              }
              h /= 6;
            }
            
            h = h * 100
            s = s * 100
            v = b * 100
          
            // Return the HSB values as an object
            return [h, s, v];
          }
        var h = RGBToHSB(r, g, b)[0];
        var s = RGBToHSB(r, g, b)[1];
        var b = RGBToHSB(r, g, b)[2];

        h = floatToInt(h);
        s = floatToInt(s);
        b = floatToInt(b);

        return [h, s, b];
    }
    return rgbToHsb(convhexToHsb(hex)[0], convhexToHsb(hex)[1], convhexToHsb(hex)[2]);
}

module.exports = hexToHsb;