const fs = require('fs');
const path = require('path');

function getLocations(dir, baseDir = '') {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of list) {
        if (item.name.startsWith('.')) continue;

        const fullPath = path.join(dir, item.name);
        const relativePath = path.join(baseDir, item.name);

        if (item.isDirectory()) {
            results = results.concat(getLocations(fullPath, relativePath));
        } else if (item.name.toLowerCase() === 'index.html' && relativePath !== 'index.html') {
            const folderPath = path.dirname(relativePath).replace(/\\/g, '/');
            const formattedName = folderPath
                .split('/')
                .map(segment => segment.replace(/-/g, ' '))
                .join(' — ');

            results.push({
                name: formattedName,
                url: `./${folderPath}/`
            });
        }
    }

    return results;
}

const locations = getLocations('./');

locations.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

fs.writeFileSync('./locations.json', JSON.stringify(locations, null, 2));
console.log(`Generated locations.json with ${locations.length} entries.`);
