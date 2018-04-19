const fs = require('fs');
const mkdirp = require('mkdirp');
const image = require('image-downloader').image;

class SimpleUploader {

    constructor() {
        this.configFile = __dirname + '/../config.json';
        this.dataDir = __dirname + '/../data';
        this.createDataDir();
        this.readConfig();
    }

    createDataDir() {
        mkdirp.sync(this.dataDir);
    }

    readConfig() {
        let fileName = this.configFile;
        let configFile = fs.readFileSync(fileName);
        let config = JSON.parse(configFile);
        if (! config.url ) {
            throw new Error('url not set in ' + fileName);
        }
        if (! config.image_file_name) {
            throw new Error('drive_file_name not set in ' + fileName);
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
