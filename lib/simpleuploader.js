const fs = require('fs');
const image = require('image-downloader').image;

class SimpleUploader {

    constructor() {
        this.configFile = __dirname + '/../config.json';
        this.dataDir = __dirname + '/../data';
        this.readConfig();
    }

    readConfig() {
        let fileName = this.configFile;
        let configFile = fs.readFileSync(fileName);
        let config = JSON.parse(configFile);
        if (! config.url ) {
            throw new Error('url not set in ' + fileName);
        }
        if (! config.image_file_name) {
            throw new Error('image_file_name not set in ' + fileName);
        }
        if (! config.interval) {
            throw new Error('interval not set in ' + fileName);
        }
        if (isNaN(config.interval)) {
            throw new Error('interval must be a number of milliseconds');
        }
        if (config.interval < 30000) {
            throw new Error('interval must be greater than 30 seconds');
        }
        this.config = config;
        return config;
    }

    saveConfig() {
        let fileData = JSON.stringify(this.config, null, 2);
        let fileName = this.configFile;
        fs.writeFileSync(fileName, fileData);
    }
    
    readCameraImage() {
        let imageDest = this.dataDir + '/' + this.config.image_file_name;
        return new Promise((resolve, reject) => {
            image({
                url: this.config.url,
                dest: imageDest
            }).then((filename, image) => {
                this.rawImage = filename.image;
                this.fullImagePath = filename.filename;
                resolve(filename.filename);
            }).catch((err) => {
                console.log(err.message);
                reject(err);
            });    
        });
    }

}

module.exports = SimpleUploader;
