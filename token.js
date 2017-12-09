var jwt = require('jsonwebtoken');

var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex')

module.exports = {
    encode: function(sub) {
        return jwt.sign({sub : sub}, secret)
    },
    decode: function(token) {
        return jwt.verify(token, secret)
    }
}