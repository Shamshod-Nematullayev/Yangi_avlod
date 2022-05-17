const mongoose = require('mongoose');

const News = mongoose.Schema({
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
    likes: {
        type: Array
    },
    link: {
        type :String
    }
})

module.exports = mongoose.model('New', News)