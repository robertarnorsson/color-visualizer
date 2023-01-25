const fs = require('fs');

module.exports = {
    saveToJson: function(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data));
        } catch (err) {
            console.error(`Error saving data to ${filePath}: ${err}`);
        }
    },
    loadFromJson: function(filePath) {
        try {
            const loadedData = JSON.parse(fs.readFileSync(filePath));
            return loadedData;
        } catch (err) {
            console.error(`Error loading data from ${filePath}: ${err}`);
        }
    }
};
