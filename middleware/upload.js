const multer = require('multer');
const User = require('../model/User')
const path = require('path');
const ProductionData = require('../model/ProductionData')

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'public/dataForYangiAvlod');
    },
    filename: async (req, file, cb)=>{
        
        const user = await User.findById(req.params.adminID)
        const imgName = Date.now()+path.extname(file.originalname)
        if(user.isAdmin){
            const data = await ProductionData.findByIdAndUpdate(process.env.DATA_ID, {imgForData: imgName})
        } 
        cb(null, imgName);
    }
})

const upload = multer({
    storage: storage
})

module.exports = upload