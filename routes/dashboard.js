var express = require('express');
var path = require('path');
var connection = require('../lib/dbconn');
var moment = require('moment');

var router = express.Router();

function isAuthenticated(req, res, next) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}

router.get('/', isAuthenticated, function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/dashboard.html'));
});

router.get('/dashboard.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/javascript/dashboard.js'));
});

router.get('/logout', isAuthenticated, function(req, res) {
    req.logout();
    res.send(JSON.stringify({done: true}));
});

router.get('/listTask', isAuthenticated, function (req, res) {
     var sql =  'SELECT t.TaskId, t.TaskName, t.TaskDesc, a.AccountName, t.TaskStartTime, t.TaskEndTime, t.TaskPriority, t.ActiveFlag\n' +
                'FROM projDB.Task t, \n' +
                'projDB.Accounts a\n' +
                'WHERE t.TaskOwnerId = ' + req.session.passport.user + ' \n' +
                'AND a.AccountId = ' + req.session.passport.user + ';';
     connection.query(sql, function (err, result) {
         if (err) throw err;
         res.send(JSON.stringify(result));
     });
});

router.get('/loadTable', isAuthenticated, function (req, res) {
    var fromDate = moment(req.query.dateQuery).startOf('week').format('YYYY-MM-DD HH-mm-ss');
    var toDate = moment(req.query.dateQuery).endOf('week').format('YYYY-MM-DD HH-mm-ss');
    console.log({
        from: fromDate.toString(),
        to: toDate.toString()
    });
	var sql =   'SELECT t.TaskId, t.TaskName, t.TaskDesc, t.TaskStartTime, t.TaskEndTime, t.TaskPriority, t.ActiveFlag\n' +
				'FROM projDB.Task t \n' +
                'WHERE t.TaskOwnerId = ' + req.session.passport.user + '\n' +
                'AND t.TaskStartTime BETWEEN "' + fromDate + '" AND "' + toDate + '"\n' +
                'ORDER BY t.TaskStartTime;';
	connection.query(sql, function(err, result) {
            if (err) throw err;
            for (var i = 0; i < result.length; i++) {
                result[i].TaskStartTime = moment(result[i].TaskStartTime);
                result[i].TaskEndTime = moment(result[i].TaskEndTime);
            }
            res.send(JSON.stringify(result));
        });
});

router.get('/searchTask', isAuthenticated, function (req, res) {
     var sql =  'SELECT t.TaskId, t.TaskName, t.TaskDesc, a.AccountName, t.TaskStartTime, t.TaskEndTime, t.TaskPriority, t.ActiveFlag\n' +
                'FROM projDB.Task t,\n' +
                'projDB.Accounts a\n' +
                'WHERE (t.TaskName LIKE \'%' + req.query.searchStr + '%\' \n' +
                'OR t.TaskDesc LIKE \'%' + req.query.searchStr + '%\') \n' +
                'AND TaskOwnerId = ' + req.session.passport.user + ' \n' +
                'AND a.AccountId = ' + req.session.passport.user + ';';
        connection.query(sql, function(err, result) {
            if (err) throw err;
            res.send(JSON.stringify(result));
        });
});

router.get('/getSingleTask', isAuthenticated, function(req, res) {
    var sql =   'SELECT t.TaskId, t.TaskName, t.TaskDesc, t.TaskStartTime, t.TaskEndTime, t.TaskPriority, t.ActiveFlag \n' +
                'FROM projDB.Task t \n' +
                'WHERE t.TaskId = ' + req.query.id + '\n' +
                'AND t.TaskOwnerId =' + req.session.passport.user + ';';
    connection.query(sql, function (err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result[0]));
    });
});

router.post('/addTask', isAuthenticated, function (req, res) {
    var startDateTime = moment(req.body.startDateTime).format('YYYY-MM-DD HH-mm-ss');
    var endDateTime = moment(req.body.endDateTime).format('YYYY-MM-DD HH-mm-ss');
    var sql =   'SELECT * \n' +
        'fROM projDB.Task \n' +
        'WHERE (TaskStartTime <= "' + startDateTime + '"\n' +
        'AND TaskEndTime >= "' + startDateTime + '")\n' +
        'OR (TaskStartTime <= "' + endDateTime + '"\n' +
        'AND TaskEndTime >= "' + endDateTime + '");\n';
    connection.query(sql, function(err, result) {
        if (err) throw err;
        if (result.length < 1) {
            var sql =   'INSERT INTO projDB.Task(TaskName, TaskDesc, TaskOwnerId, TaskStartTime, TaskEndTime, TaskPriority)\n' +
                'VALUES("' + req.body.taskTitle + '", "' + req.body.taskDesc + '", ' + req.session.passport.user + ', "' + startDateTime + '", "' + endDateTime +
                '", ' + req.body.taskPriority + ');';
            connection.query(sql, function (err, result) {
                if (err) throw err;
                res.send(JSON.stringify(result));
            });
        } else {
            res.send(JSON.stringify({error: 'There is already a task during this time.'}));
        }
    });
});

router.post('/editTask', isAuthenticated, function(req, res) {
    var startDateTime = moment(req.body.startDateTime).format('YYYY-MM-DD HH-mm-ss');
    var endDateTime = moment(req.body.endDateTime).format('YYYY-MM-DD HH-mm-ss');
    var sql =   'SELECT * \n' +
        'FROM projDB.Task \n' +
        'WHERE (TaskStartTime <= "' + startDateTime + '"\n' +
        'AND TaskEndTime >= "' + startDateTime + '")\n' +
        'OR (TaskStartTime <= "' + endDateTime + '"\n' +
        'AND TaskEndTime >= "' + endDateTime + '")';
    connection.query(sql, function(err, result) {
        if (err) throw err;
        var isSelf = true;
        for (var i = 0; i < result.length; result++) {
            var id = result[i].TaskId.toString();
            if (id !== req.body.id) {
                isSelf = false;
            }
        }
        if (result.length < 1 || isSelf) {
            var sql =   'UPDATE projDB.Task\n' +
                'SET TaskName = "' + req.body.taskTitle + '",\n' +
                'TaskDesc = "' + req.body.taskDesc + '",\n' +
                'TaskStartTime = "' + startDateTime + '",\n' +
                'TaskEndTime = "' + endDateTime + '",\n' +
                'TaskPriority = ' + req.body.taskPriority + '\n' +
                'WHERE TaskId = ' + req.body.id + ';';
            connection.query(sql, function(err, result) {
                if (err) throw err;
                res.send(JSON.stringify(result));
            });
        } else {
            res.send(JSON.stringify({error: 'There is already a task during this time.'}));
        }
    });
});

router.post('/complete', isAuthenticated, function(req, res) {
    var tOrF = req.body.isComplete ? 1 : 0;
    var sql = 'UPDATE projDB.Task\n' +
        'SET ActiveFlag = ' + tOrF + '\n' +
        'WHERE TaskId = ' + req.body.taskId;
    connection.query(sql, function(err, result) {
        if (err) throw  err;
        res.send(JSON.stringify({success: true}));
    })
});

router.post('/deleteTask', isAuthenticated, function(req, res) {
    var sql =   'DELETE FROM projDB.Task\n' +
                'WHERE TaskId = ' + req.body.taskId + ';';
    connection.query(sql, function(err, result) {
        if (err) throw err;
        res.send(JSON.stringify({success: true}));
    });
});


module.exports = router;