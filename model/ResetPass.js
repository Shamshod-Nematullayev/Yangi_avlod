const mongoose = require('mongoose');

const ResetPassSchema = mongoose.Schema({
    userId: String,
    resetString: String,
    createdAt : Date,
    expiresAt : Date
})

module.exports = mongoose.model('ResetPass', ResetPassSchema);
