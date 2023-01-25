const getContrast = require('./getContrast')

function getTextColor(bgColor) {
    const whiteContrast = getContrast(bgColor, "#ffffff");
    const blackContrast = getContrast(bgColor, "#000000");
    const bordertrans = getContrast(bgColor, "#ffffff");
    const borderblack = getContrast(bgColor, "#000000");

    return [whiteContrast > blackContrast ? "#ffffff" : "#000000", borderblack > bordertrans ? "transparent" : "#ffffff"];
}

module.exports = getTextColor;