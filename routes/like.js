const express = require('express');
const router = express.Router()
const NewsModel = require('../model/News')
const io = require('socket.io');

router.post('/:id',async (req, res)=>{
    const data = await NewsModel.findById(req.params.id)
    if(!data){
        return res.status(400).send('This Data is not defined')
    }

    if(data.likes.find(req.session.userId)){
        await NewsModel.findByIdAndUpdate(req.params.id, {$pull: {likes: req.session.userId}})
        res.redirect('/')
    }else{
        await NewsModel.findByIdAndUpdate(req.params.id, {$push: {likes: req.session.userId}})
        res.redirect('/')
    }
})

module.exports = router;