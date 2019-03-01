var express = require('express');
var path = require('path');
var router = express.Router();


router.get('/stylesheets/style.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/stylesheets/style.css'));
});

router.get('/css/bootstrap.css', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/lib/css/bootstrap.css'));
});

router.get('/js/bootstrap.bundle.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/lib/js/bootstrap.bundle.js'));
});

router.get('/js/jquery.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/lib/js/jquery.js'));
});

router.get('/js/asynch.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/javascript/asynch.js'));
});

router.get('/html/weekly_view.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/html/weekly_view.html'));
});

router.get('/html/list_view.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/html/list_view.html'));
});

module.exports = router;