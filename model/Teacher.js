const mongoose = require('mongoose');

const Teacher = mongoose.Schema({
    image: String,
    title: {
        type: String,
        max: 60
    },
    desc:{
        type: String,
        min: 100,
        max: 1000
    },
    date: {
        type: String,
        max: 7
    },
    year: {
        type : String,
        max: 4
    },
    email: String,    
    telegram: String,
    instagram: String,
    phone: String,
    work: String
})

module.exports = mongoose.model('Teacher', Teacher)