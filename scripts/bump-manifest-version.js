const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const manifestPath = path.join(__dirname, '../src/manifest.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageVersion = packageJson.version;

fs.readFile(manifestPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Failed to read manifest:', err);
        process.exit(1);
    }

    let manifest;
    try {
        manifest = JSON.parse(data);
    } catch (parseErr) {
        console.error('Manifest is not valid JSON:', parseErr);
        process.exit(1);
    }

    if (!manifest.version) {
        console.error('Manifest does not contain a version field.');
        process.exit(1);
    }
    manifest.version = packageVersion;

    fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), (writeErr) => {
        if (writeErr) {
            console.error('Failed to write manifest:', writeErr);
            process.exit(1);
        }
        console.log('Manifest version bumped to', manifest.version);
    });
});
