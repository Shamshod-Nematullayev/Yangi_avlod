const mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
    username :{
        type: String,
        required: true,
        min: 6,
        max: 20,
        unique: true
    },
    email:{
        type: String,
        required: true,
        max: 50,        
        unique: true
    },
    password:{
        type: String,
        required: true,
        min: 6
    },
    profilePicture:{
        type: String,
        default: ''
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    verified :{
        type: Boolean,
        default : false
    }
});

module.exports = mongoose.model('User', UsersSchema);