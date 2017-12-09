var express    = require("express")
var bodyParser = require("body-parser")
var passport   = require("passport")
var Q          = require("q")
var Token      = require("./token")
var mongoose   = require('mongoose')

const env = process.env;

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Babe Alert server is up and running! Ready to take the babes.', 200);
})

mongoose.Promise = require('q').Promise;
mongoose.connect('mongodb://localhost/babealert', { useMongoClient:true }, function(err) {
    if (err) {
        console.err(err);
    } else {
        console.log('Connected');
    }
});

const User  = require('./models/user')
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Alert  = require('./models/alert')
const Login = require('./login')(app, User)
const Alerter = require('./alerter')(app, Login, Alert)

var server = app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Listening at %s:%s", host, port);
});



//db.users.ensureIndex({location: "2dsphere"});
