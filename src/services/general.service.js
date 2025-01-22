const fs = require('fs');
const https = require('https');
const path = require('path');

const downloadFileAndReturnName = (fileName, url, destDir) => {
    return new Promise((resolve, reject) => {
        try {
            // Extract the file name from the URL
            const dest = path.join(destDir, fileName);

            // Ensure the destination directory exists
            fs.mkdirSync(destDir, { recursive: true });

            // Create a write stream and download the file
            const file = fs.createWriteStream(dest);
            https.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => resolve(fileName));
                });
            }).on('error', (err) => {
                fs.unlink(dest, () => {}); // Clean up partial file on error
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { downloadFileAndReturnName };
