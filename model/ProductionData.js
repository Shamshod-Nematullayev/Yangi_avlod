const mongoose = require('mongoose');

const ProductionData = mongoose.Schema({
    phoneNumberForHeader: String,
    Openingdesc: {
        type: String,
        min: 50,
        max: 300
    },
    backgroundImage: {
        type: String,
        required: true
    },
    slider: {
        type: Array(Object),
    },
    imgForData: String,
    descForData: String,
    emailForHeader : {
        type: String,
        max: 200,
        min: 300
    },
    logoImage: {
        type: String,
        require: true
    },
    telegramAccountForFooter:{
        type: String
    },
    descForFooter:{
        type:String,
        max: 200
    },
    emailForFooter: String,
    phones: Array(String),
    emails: Array(String),
    admins: Array(String),
    bizBilanBoglanish: Object,

    
})

module.exports = mongoose.model('ProductionData', ProductionData);