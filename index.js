const fs = require('fs');
const {google} = require('googleapis');
const authorize = require('./lib/google.js');
const SimpleUploader = require('./lib/simpleuploader.js');

app = new SimpleUploader();
runApp();
setInterval(runApp, 60000);

function runApp() {
    app.readCameraImage().then((filename) => {
        // Load client secrets from a local file.
        fs.readFile('client_secret.json', (err, client_secret_content) => {
            if (err) return console.log('Error loading client secret file:', err);
            let client_secret = JSON.parse(client_secret_content);

            if (app.config.drive_file_id) {
                authorize(client_secret, updateImageOnDrive);
            } else {
                authorize(client_secret, createImageOnDrive);
            }
        });
    });
}

function createImageOnDrive(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.create({
        resource: { 'name': app.config.image_file_name },
        media: {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(app.fullImagePath),
            fields: 'id'
        }
    }, (err, file) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        app.config.drive_file_id = file.data.id;
        app.saveConfig();
    });
}

function updateImageOnDrive(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.update({
        fileId: app.config.drive_file_id,
        media: {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(app.fullImagePath)
        }
    }, (err, rawResponse) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('Image updated');
    });
}
