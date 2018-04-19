const fs = require('fs');
const {google} = require('googleapis');
const authorize = require('./lib/google.js');
const SimpleUploader = require('./lib/simpleuploader.js');

app = new SimpleUploader();
app.readCameraImage().then((filename) => {
    // Load client secrets from a local file.
    fs.readFile('client_secret.json', (err, client_secret_content) => {
        if (err) return console.log('Error loading client secret file:', err);
        let client_secret = JSON.parse(client_secret_content);
        authorize(client_secret, createImageOnDrive);
    });
});

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    }, (err, {data}) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
          console.log('No files found.');
        }
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
        if (err) return console.log(err);
        app.config.drive_file_id = file.data.id;
        app.saveConfig();
    });
}

function getImageFromDrive(auth, fileId) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.get({
        fileId: fileId
    }, (err, {data}) => {
        if (err) return console.log('Error' + err);
        console.log(data);
    });
}
