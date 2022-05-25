const mongoose = require('mongoose');

const db = mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>{
        console.log('MongoDB connected...');
    })
    .catch(err=>{
        console.log('MongoDB connection error...', err);
    })

module.exports = db;
