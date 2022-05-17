const mongoose = require('mongoose');

const CourseSchema = mongoose.Schema({
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
    price: {
        type: String,
        max: 30
    },
    demo: {
        type: String,
        min: 3,        
    },
    skills: Array(String)
})

module.exports = mongoose.model('Course', CourseSchema) 