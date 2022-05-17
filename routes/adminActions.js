const express = require('express');
const router = express.Router();
const User = require('../model/User')
const ProductionData = require('../model/ProductionData')
const upload = require('../middleware/upload');
const { route } = require('./productionData');

router.get('/:adminID/prodData/rename_1',async (req, res)=>{
    try {
        const user =await User.findById(req.params.adminID)
        if(!user){
            res.status(403).send('Bunday ID ga ega foydalanuvchi topilmadi')
        }else{
            if(user.isAdmin){
                const content = await ProductionData.findOne({name: "mainpage"})
                const data = content
                res.status(200).render('content/rename_1.ejs', {adminID: req.params.adminID, data, message: ""})
            }else{
                res.status(400).send('Siz bu sahifaga kirish huquqiga ega emassiz')
            }
        }
    } catch (err) {
        if(err) {
            res.status(500).json(err)
        }
    }
})

router.get('/:adminID/prodData/slider',async (req, res)=>{
    try {
        const user =await User.findById(req.params.adminID)
        if(!user){
            res.status(403).send('Bunday ID ga ega foydalanuvchi topilmadi')
        }else{
            if(user.isAdmin){
                const content = await ProductionData.findOne({name: "mainpage"})
                const data = content.slider
                res.status(200).render('content/sliderControl.ejs', {adminID: req.params.adminID, data})
            }else{
                res.status(400).send('Siz bu sahifaga kirish huquqiga ega emassiz')
            }
        }
    } catch (err) {
        if(err) {
            res.status(500).json(err)
        }
    }
})
router.get('/:adminID/prodData/rename_3',async (req, res)=>{
    try {
        const user =await User.findById(req.params.adminID)
        if(!user){
            res.status(403).send('Bunday ID ga ega foydalanuvchi topilmadi')
        }else{
            if(user.isAdmin){
                const data =  await ProductionData.findOne({name: "mainpage"})
                res.status(200).render('content/dataForYangiAvlod.ejs', {adminID: req.params.adminID, data, message: ''})
            }else{
                res.status(400).send('Siz bu sahifaga kirish huquqiga ega emassiz')
            }
        }
    } catch (err) {
        if(err) {
            res.status(500).json(err)
        }
    }
});

router.get('/:adminID/prodData/rename_6',async (req, res)=>{
    try {
        const user =await User.findById(req.params.adminID)
        if(!user){
            res.status(403).send('Bunday ID ga ega foydalanuvchi topilmadi');
        }else{
            if(user.isAdmin){
                const data =  await ProductionData.findOne({name: "mainpage"});
                res.status(200).render('content/rename_6.ejs', {adminID: req.params.adminID, data, message: ''});
            }else{
                res.status(400).send('Siz bu sahifaga kirish huquqiga ega emassiz');
            }
        }
    } catch (err) {
        if(err) {
            res.status(500).json(err);
        }
    }
});

router.get('/:adminID/prodData/rename_7',async (req, res)=>{
    try {
        const user =await User.findById(req.params.adminID)
        if(!user){
            res.status(403).send('Bunday ID ga ega foydalanuvchi topilmadi')
        }else{
            if(user.isAdmin){
                const content = await ProductionData.findOne({name: "mainpage"})
                const data = content.bizBilanBoglanish
                res.status(200).render('content/rename_7.ejs', {adminID: req.params.adminID, data, message: ""})
            }else{
                res.status(400).send('Siz bu sahifaga kirish huquqiga ega emassiz')
            }
        }
    } catch (err) {
        if(err) {
            res.status(500).json(err)
        }
    }
})


module.exports = router;