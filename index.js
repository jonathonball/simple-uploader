const fs = require('fs');
const {google} = require('googleapis');
const authorize = require('./lib/quickstart.js');
const Initialization = require('./lib/initialization.js');

init = new Initialization();
init.readCameraImage().then((filename) => {
    // Load client secrets from a local file.
    fs.readFile('client_secret.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      //authorize(JSON.parse(content), createImageOnDrive);
      //if (init.config.image_file_name === null) {
          authorize(JSON.parse(content), createImageOnDrive);
      //}
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
        resource: { 'name': init.config.image_file_name },
        media: {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(init.fullImagePath),
            fields: 'id'
        }
    }, (err, file) => {
        if (err) return console.log(err);
        init.config.drive_file_id = file.data.id;
        init.saveConfig();
    });
}

function getImageFromDrive(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.get({
        
    }, (err, {data}) => {
        if (err) return console.log('Error' + err);
        console.log(data);
    });
}
