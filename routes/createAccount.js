var express = require('express');
var path = require('path');
var connection = require('../lib/dbconn');

var router = express.Router();

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/Add_Person.html'));
});

router.get('/AddPerson.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/javascript/AddPerson.js'));
});

router.post('/create', function(req, res) {
    var params = req.body;
    var result = {};
    if (params.password !== params.redoPassword) {
        result.error = 'Passwords do not match';
        res.send(JSON.stringify(result));
    }
    connection.query('SELECT * FROM projDB.Accounts WHERE AccountName = "' + params.username + '";', function(err, qResult) {
        if (err) throw err;
        if (qResult.length > 0) {
            result.error = 'Username already exists';
            res.send(JSON.stringify(result));
        } else {
            var sql = 'CALL projDB.CreateAccount("' + params.username +
                '", "' + params.password + '"); \n';
            connection.query(sql, function (err, result) {
                if (err) throw  err;
                var sql1 = 'SELECT AccountId FROM projDB.Accounts WHERE AccountName = "' + params.username + '";';
                connection.query(sql1, function(err, result) {
                    if (err) throw err;
                    var userId = result[0].AccountId;
                    var sql2 =  'INSERT INTO projDB.Person(UserId, FirstName, LastName, Age) \n' +
                        'VALUES (' + userId + ', "' + params.firstName + '", "' +
                        params.lastName + '", ' + params.age + ');';
                    connection.query(sql2, function(err, result) {
                        if (result.affectedRows > 0) {
                            res.send(JSON.stringify({success: true}));
                        } else {
                            res.send(JSON.stringify({success: false}));
                        }
                    });
                });
            });
        }
    });
});

module.exports = router;