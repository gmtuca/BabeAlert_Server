var express    = require("express")
var passport   = require("passport")
var Q          = require("q")
var Token      = require("./token")

module.exports = function(app, User) {
    function profile(token){
        var deferred = Q.defer()

        if(!token)
            deferred.reject("Null token")

        _id = Token.decode(token).sub

        User.findById(_id,
            function (err, user) {
                if(err) deferred.reject(err)
                else if(user){
                    if(!user || !user.username) deferred.reject("User not found for token")

                    console.log("Found user", user.username, "for token")
                    deferred.resolve({
                        _id: user._id,
                        username: user.username
                    })
                } else {
                    deferred.reject("Invalid token")
                }

        });

        return deferred.promise
    }

    function login(username, password){
        var deferred = Q.defer()

        if(!username || !password){
            deferred.reject({message: "Username or password not specified"})
        }

        console.log("Logging in", username)

        var authenticate = User.authenticate()
        authenticate(username, password, function(err, user){
            if (err) deferred.reject(err)
            else if(!user || !user._id) deferred.reject("No user found")
            else deferred.resolve(user._id)
        })

        return deferred.promise
    }

    function register(properties, password){
        var deferred = Q.defer()

        if(!properties || !properties.username || !password){
            deferred.reject({message: "Username or pasword not specified"})
        }

        User.register(properties, password, function(err, user){
            if (err) deferred.reject(err)
            else {
                var authenticate = User.authenticate()
                authenticate(properties.username, password, function(err, result) {
                 if (err) deferred.reject(err)
                 else {
                    console.log("Created user", properties.username)
                    deferred.resolve(result)
                 }
                })
            }
           })

        return deferred.promise
    }

    app.post('/register', function(req, res) {
        register({username: req.body.username}, req.body.password)
            .then(() => {
                res.status(201).send("OK")
            })
            .catch(err => {
                res.status(400).send(err)
            })
    })

    app.post('/login', function(req, res) {
        login(req.body.username, req.body.password)
            .then(_id => {
                res.status(200).send({token: Token.encode(_id)})
            })
            .catch(err => {
                res.status(401).send(err)
            })
    })

    app.post('/profile', function(req, res){
        profile(req.get("Authorization"))
            .then(profile => {
                res.status(200).send(profile)
            })
            .catch(err => {
                console.log("error with profile...", err)
                res.status(401).send(err)
            })
    })

    return {
        profile: profile,
        register: register,
        login: login
    }
}
