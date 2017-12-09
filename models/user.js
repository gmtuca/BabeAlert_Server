var mongoose   = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
                        lastAlertDate: {
                            type: Date,
                            required: false,
                            default: null
                        }
                    },
                    { collection: 'users' });

User.plugin(passportLocalMongoose, { usernameLowerCase: true });

module.exports = mongoose.model('User', User)