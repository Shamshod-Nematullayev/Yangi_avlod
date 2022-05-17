const mongoose = require('mongoose');

const UsersVerificationSchema = new mongoose.Schema({
    userId : String,
    uniqueString : String,
    createdAt : Date,
    expiresAt : Date
},
{timestamps: true}
)

module.exports = mongoose.model('UserVerification', UsersVerificationSchema);