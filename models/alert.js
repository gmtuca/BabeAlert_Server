var mongoose   = require('mongoose')

const Alert = new mongoose.Schema(
                        {
                            user: {
                                type: mongoose.Schema.Types.ObjectId,
                                required: true
                            },
                            date: {
                                type: Date,
                                required: false,
                                default: Date.now
                            },
                            location: {
                                type: {
                                    type: String,
                                    required: false,
                                    enum: 'Point',
                                    default: 'Point'
                                },
                                coordinates: {
                                    type: [ Number ]
                                }
                            }
                        }, { collection: 'alerts' });

Alert.index({location: '2dsphere'});
//Alert.index({user: 1})

module.exports = mongoose.model('Alert', Alert)