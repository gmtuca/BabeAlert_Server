var Q          = require("q")
var Alert      = require("./models/alert")
var User       = require("./models/user")

module.exports = function(app, Login) {

    function updateUserWithAlertTiming(user_id){
        var deferred = Q.defer()

        console.log("Updating user timing of", user_id)

        User.findById(user_id, function (err, user) {
            if(err) deferred.reject(err)
            else {
                user.update({ lastAlertDate: new Date },
                            function(err, result){
                                if(err) deferred.reject(err)
                                else    deferred.resolve("OK")
                            })
            }
        });

        return deferred.promise
    }

    function alertBabe(al){
        console.log("Alerting babe", al)

        var deferred = Q.defer()

        if(!al || !al.location){
            deferred.reject("Invalid alert")
        }

        var dbAlert = {
          user: al.user,
          date: al.date,
          location: {
            type: 'Point',
            coordinates: [ al.location.lng, al.location.lat ]
          }
        };

        Alert.collection.insert(dbAlert,
            function(err, docs) {
                 if (err) deferred.reject(err)
                 else {
                    //TODO these should be in an atomic transaction...
                    deferred.resolve("OK")
                    /*
                    updateUserWithAlertTiming(al.user)
                        .then(doc => {
                            console.log("gets here")
                            deferred.resolve("OK")
                        })
                        .catch(err => {
                            deferred.reject(err)
                        })
                    */
                 }
            });

        return deferred.promise
    }

    const SEARCH_RADIUS = 5000000

    function alertsNear(location){
        console.log("Alerts near", location)

        var deferred = Q.defer()

        Alert.collection.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [ location.lng, location.lat ]
                    },
                    $maxDistance: SEARCH_RADIUS
                }
            }
        }).toArray(function(err, alerts){
                       if(err) deferred.reject(err);
                       else {
                           deferred.resolve(alerts.map(a => {
                             return {
                                _id: a._id,
                                user: a.user,
                                date: a.date,
                                location: {
                                    lng: a.location.coordinates[0],
                                    lat: a.location.coordinates[1]
                                }
                             }
                           }))
                       }
                   });

        return deferred.promise
    }

    const ALERT_LIMIT_SECONDS = 10

    function canAlertAgain(user){
        lastAlertDb = user.lastAlertDate
        return !lastAlertDb ||
               lastAlertDb.getMilliseconds() + ALERT_LIMIT_SECONDS * 1000 < (new Date).getMilliseconds()
    }

    app.post('/alert', function (req, res){
        Login.profile(req.get("Authorization"))
             .then(user => {
                //if user hasn't alerted yet
                //or he is alerting within the time limit
                //if(!canAlertAgain(user)){
                //    res.status(400).send("Cannot alert twice in a roll")
                //}

                alertBabe({
                    user: user._id,
                    date: new Date,
                    location: {
                        lng: req.body.location.lng,
                        lat: req.body.location.lat
                    }
                })
                .then(result => {
                    res.status(200).send(result)
                })
                .catch(err => {
                    res.status(400).send(err)
                })
             })
             .catch(err => {
                res.status(401).send(err)
             })
    })

    app.post('/near', function(req, res){
        Login.profile(req.get("Authorization"))
             .then(user => {
                alertsNear(req.body.location)
                    .then(alerts => {
                        res.status(200).send(alerts)
                    })
                    .catch(err => {
                        res.status(400).send(err)
                    })
             })
             .catch(err => {
                res.status(401).send(err)
             })
    })
}

