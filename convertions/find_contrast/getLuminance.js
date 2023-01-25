const getsRGB = require('./getsRGB')

function getLuminance(hexColor) {
    return (
    0.2126 * getsRGB(hexColor.substr(1, 2)) +
    0.7152 * getsRGB(hexColor.substr(3, 2)) +
    0.0722 * getsRGB(hexColor.substr(-2))
    );
}

module.exports = getLuminance;