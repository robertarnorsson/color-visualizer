function getRGB(c) {
    return parseInt(c, 16) || c;
}

function getsRGB(c) {
    return getRGB(c) / 255 <= 0.03928
    ? getRGB(c) / 255 / 12.92
    : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4);
}

module.exports = getsRGB;