var express    = require("express");
var bodyParser = require("body-parser");
var mysql      = require("mysql");
var db_config  = require("./db_config")

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var connection = mysql.createConnection(db_config);

//    /etc/init.d/mysql start
//    mysql -u root -p

connection.connect();

function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "/" +
        twoDigits(1 + this.getUTCMonth()) + "/" +
        twoDigits(this.getUTCDate()) + " " +
        twoDigits(this.getUTCHours()) + ":" +
        twoDigits(this.getUTCMinutes()) + ":" +
        twoDigits(this.getUTCSeconds());
};

app.get('/', function (req, res) {
    res.statusCode = 200; //ok
    res.send('Babe Alert Server is up and running!');
});

app.get('/alert', function (req, res) {
    res.statusCode = 400; //bad request
    res.send(
        JSON.stringify({ success: false,
                         description: '/alert should only be used for POST'}));
});

app.post('/alert', function (req, res) {

    res.setHeader('Content-Type', 'application/json');

    var alert = req.body;

    if(!alert.location || !alert.location.lat || !alert.location.lon){
        res.statusCode = 400; //bad request
        res.send(
            JSON.stringify({ success: false,
                             description: 'Invalid parameters'}));
        return;
    }

    var location = alert.location;
    var ip = req.connection.remoteAddress;
    var time = (new Date()).toMysqlFormat();

    connection.query(
        "INSERT INTO Alert(ip,latitude,longitude,vote_time) " +
        "VALUES(?,?,?,?);",
        [ip, location.lat, location.lon, time],
        function(err, r) {
            if(err || r.affectedRows < 1){
                res.statusCode = 500; //internal server error
                console.warn(err);
                res.send(
                    JSON.stringify({ success: false,
                                     description: 'Unable to update DB'}));
                return;
            }

            console.log('> '+ ip + ' (' + location.lat + ', ' + location.lon + ') @ ' + time);
            res.statusCode = 200; // ok
            res.send(JSON.stringify({ success: true }));

    });
});

app.post('/babes', function (req, res) {

    res.setHeader('Content-Type', 'application/json');

    //var params = req.body;
    // TODO contain from-to on the map and preferences... not SELECT ALL

    connection.query(
        "SELECT latitude, longitude FROM Alert;"
        , function(err, rows, fields) {
            if(err){
                res.statusCode = 500; //internal server error
                console.warn(err);
                res.send(
                    JSON.stringify({ success: false,
                                     description: 'Unable to select from DB'}));
                return;
            }

            res.statusCode = 200;
            res.send(JSON.stringify({ success: true,
                                      alerts:rows }));
        });
});

var server = app.listen(8085, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Listening at %s:%s", host, port);
});

//connection.end();
