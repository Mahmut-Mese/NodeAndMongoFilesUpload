const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const mongodb = require('mongodb');
const fs = require('fs');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {

        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }

})
var upload = multer({
    storage: storage

})
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';
MongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, (err, client) => {
    if (err) return console.log(err);
    db = client.db('Images');
    app.listen(8000, () => {
        console.log('listenign 3000')
    })
})
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});
app.post('/uploadFile', upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error('please upload a file');
        error.httpStatusCode = 400;
        return next(error);

    }
    res.send(file);
});
app.post('/uploadmultiple', upload.array('myFiles', 10), (req, res, next) => {
    const files = req.files;
    if (!files) {
        const error = new Error('please upload a file');
        error.httpStatusCode = 400;
        return next(error);

    }
    res.send(files);
});
app.post('/uploadphoto', upload.single('myImage'), (req, res, next) => {
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    var finalImg = {
        contentType: req.file.mimetype,
        path: req.file.path,
        image: new Buffer(encode_image, 'base64')
    }
    db.collection('image').insertOne(finalImg, (err, result) => {
        console.log(result);
        if (err) return console.log(err);
        console.log('saved to database');
        res.contentType(finalImg.contentType);
        res.send(finalImg.image);
    })

})
app.listen(9000, () => {
    console.log("listening 5000")
})