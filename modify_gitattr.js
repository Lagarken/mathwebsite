const fs = require('fs');
const path = require('path');

const gitattrPath = path.join(__dirname, '.gitattributes');

fs.readFile(gitattrPath, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const lines = data.split('\n');
    const newLines = lines.map(line => {
        if (line.startsWith('static/')) {
            return line.replace('static/', '');
        }
        return line;

    });
    const newData = newLines.join('\n');

    fs.writeFile(gitattrPath, newData, 'utf8', (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('gitattributes modified');
    });
});