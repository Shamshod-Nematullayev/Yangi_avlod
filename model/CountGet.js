const mongoose = require('mongoose');

const CountGet = mongoose.Schema({
    visitHomePage: Number,
    date: String
})

module.exports = mongoose.model('Count', CountGet) 

