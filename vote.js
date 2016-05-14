var express    = require("express");
var bodyParser = require("body-parser");
var mysql      = require('mysql');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var connection = mysql.createConnection({
    host     : 'localhost',
    port     : '3306',
    user     : 'root',
    password : '',
    database : 'BabeAlertDB'
});

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

app.post('/vote', function (req, res) {

    var vote = req.body;

    if(!vote.location || !vote.location.lat || !vote.location.lon){
        res.send('Invalid parameters');
        return;
    }

    var location = vote.location;
    var ip = req.connection.remoteAddress;
    var time = (new Date()).toMysqlFormat();

    connection.query(
        "INSERT INTO BabeVote(ip,latitude,longitude,vote_time) " +
        "VALUES('"+ ip +"',"+location.lat+","+location.lon+",'"+time+"');"
        , function(err, r) {
            if(err || r.affectedRows < 1){
                console.log(err);
                res.send('Failed');
            }
            else{
                console.log('BABE > '+ ip + ' (' + location.lat + ', ' + location.lon + ') @ ' + time);

                res.statusCode = 200;
                res.send();
            }
    });
});

var server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://127.0.0.1:%s", port)
});


//connection.end();
