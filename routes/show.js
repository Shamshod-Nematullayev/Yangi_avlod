const express = require('express');
const route = express.Router();
const dotenv = require('dotenv')
const req = require('express/lib/request');
const countGetHome = require('../middleware/countGetHomePage')

// models require
const ProductionData = require('../model/ProductionData');
const Users = require('../model/User')
const News = require('../model/News');


// readData
route.get('/',countGetHome,async (req, res)=>{
    try {
     const data = await ProductionData.findOne({name: "mainpage"})
     const news = await News.find()
     res.render("index.ejs", {data:data, news: news, userId: req.session.userId})
    } catch (error) {
     res.status(404).render('index.ejs', {message: "Data is defined. Create new data", userId: req.session.userId})
    }
 })
route.get('/news',countGetHome,async (req, res)=>{
    try {
     const data = await ProductionData.findOne({name: "mainpage"})
     const news = await News.find()
     res.render("news/index.ejs", {data:data, news: news, userId: req.session.userId})
    } catch (error) {
     res.status(404).render('news/index.ejs', {message: "Data is defined. Create new data", userId: req.session.userId})
    }
 })


// Tizimga admin sifatida kirish formasini jo'natish Bu url Murakkab bo'lishi kerak hozircha /admin
route.get('/admin',async (req, res)=>{
    if (req.session.userId) {
    const user = await Users.findById(req.session.userId);
    if(user.isAdmin){
        return res.redirect("/prodData/"+ req.session.userId)
    }{
        res.status(200).render('adminLogin.ejs', {message: ""})
    }
}else{
    res.status(200).render('adminLogin.ejs', {message: ""})
}
})


route.get('/prodData/:adminID',async (req, res)=>{
    try {
        const user =await Users.findById(req.params.adminID)
        if(!user){
            res.status(403).send('Bunday ID ga ega foydalanuvchi topilmadi')
        }else{
            if(user.isAdmin){
                res.status(200).render('content.ejs', {adminID:user._id, hosting: process.env.DOMAIN});
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

route.get('/createNews/:id', async (req, res)=>{
   try {
    const user = await Users.findById(req.params.id)
    if(user.isAdmin){
        const news = await News.find()
        res.status(200).render('createNews.ejs', {news: news, adminID: req.params.id});
    }else{
        res.status(400).json('Siz tizimga admin sifatida kirmagansiz. Bu sahifaga kirish huquqingiz yo\'q');
    }
   } catch (error) {
       res.status(500).send("Jo'ra borib aqling yetgan ishni qil");
   }
})


route.get("/login", (req, res)=>{
    res.render("login.ejs")
})

route.get("/forgotPass", (req, res)=>{
    res.render("forgotPass.ejs", {currentUrl: process.env.DOMAIN})
})

route.get('/forgotpass/:userID/:resetString', (req, res)=>{
    const {userID, resetString} = req.params;

    res.render('changePassword.ejs', {userID, resetString})
})

module.exports = route;