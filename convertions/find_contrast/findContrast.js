const getTextColor = require('./getTextColor')

function findContrast(hex) {
    return getTextColor(hex)
}

module.exports = findContrast;