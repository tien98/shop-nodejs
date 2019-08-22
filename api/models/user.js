const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: { type: String, require: true},
    firstName: { type: String, require: true},
    // lastName: { type: String, require: true},
    // phone: { type: Number, require: true}
});

module.exports = mongoose.model('User', userSchema);