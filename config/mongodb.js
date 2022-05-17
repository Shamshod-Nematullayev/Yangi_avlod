const mongoose = require('mongoose');

const db = mongoose.connect(process.env.MONGO_DB)
    .then(()=>{
        console.log('MongoDB connected...');
    })
    .catch(err=>{
        console.log('MongoDB connection error...', err);
    })

module.exports = db;