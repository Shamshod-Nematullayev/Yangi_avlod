const express = require('express');
const route = express.Router();
const User = require('../model/User')
const ProductionData = require('../model/ProductionData')
const dotenv = require('dotenv')

// updatedata
route.post('/:id',async (req, res)=>{
    const {phoneNumberForHeader, emailForHeader, logoImage, telegramAccountForFooter, descForFooter, emailForFooter, ...other} = req.body;
    try{
        // res.send(req.body)
        const user = await User.findById(req.params.id);
        if(user){
            if(user.isAdmin){
                const data = await  ProductionData.updateOne({name: "mainpage"},  {$set: req.body}).then(result=>{
                    res.status(200).send(req.body)
                })
            }else{
                res.status(400).json("Kechirasiz tizim ma'lumotlarini faqat ma'lum shaxslar o'zgartirish huquqiga ega")
            }
        }else{
            res.status(400).json('kechirasiz sizning IDingiz tizimda topilmadi')
        }
    }catch(err){
        res.status(500).json("Data yangilashda xatolik kuzatildi..."+err)
    }
})

route.post('/:id/rename_1', async (req, res)=>{
   try {
    const user = await User.findById(req.params.id)
    if(!user){
        res.status(404).send('Siz tizim foydalanuvchisi emassiz. Iltimos avval ro\'yhatdan o\'ting')
    }else{
        if(user.isAdmin){
            await ProductionData.updateOne({name: "mainpage"}, {$set: req.body})
            .then(async result=>{
                const data = await ProductionData.findOne({name: 'mainpage'})
                res.status(200).render('content/rename_1.ejs', {adminID: req.params.id, data, message: "Ma'lumot yangilandi"})
            })
        }else{
            res.status(400).json("Kechirasiz tizim ma'lumotlarini faqat ma'lum shaxslar o'zgartirish huquqiga ega")
        }
    }
   } catch (err) {
    res.status(500).json("Data yangilashda xatolik kuzatildi..."+err)
   }
})
route.post('/:id/slider', async (req, res)=>{
   try {
    const user = await User.findById(req.params.id)
    if(!user){
        res.status(404).send('Siz tizim foydalanuvchisi emassiz. Iltimos avval ro\'yhatdan o\'ting')
    }else{
        if(user.isAdmin){
            const data = await ProductionData.updateOne({name: "mainpage"}, {$push:{slider: req.body}})
            .then(result=>{
                res.status(200).send("Ma'lumot yangilandi")
            })
        }else{
            res.status(400).json("Kechirasiz tizim ma'lumotlarini faqat ma'lum shaxslar o'zgartirish huquqiga ega")
        }
    }
   } catch (err) {
    res.status(500).json("Data yangilashda xatolik kuzatildi..."+err)
   }
})

// clear slider
route.post('/:adminID/slider/clear',async (req, res)=>{
    try {
        const user = await User.findById(req.params.adminID)
        if(!user){
            res.status(404).send('Siz tizim foydalanuvchisi emassiz. Iltimos avval ro\'yhatdan o\'ting')
        }else{
            if(user.isAdmin){
                await ProductionData.ProductionData.updateOne({name: "mainpage"}, {$set: {slider :[]}})
                .then(result=>{
                    res.status(200).send("Ma'lumot yangilandi")
                })
            }else{
                res.status(400).json("Kechirasiz tizim ma'lumotlarini faqat ma'lum shaxslar o'zgartirish huquqiga ega")
            }
        }
       } catch (err) {
        res.status(500).json("Data yangilashda xatolik kuzatildi..."+err)
       }
})


const multer = require('multer'),
path = require('path'),
fs = require('fs')

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'public/img/YangiAvlodImg');
    },
    filename: async (req, file, cb)=>{
        
       if(req.body.image){
        const user = await User.findById(req.params.adminID)
        const imgName = Date.now()+path.extname(file.originalname)
        if(user.isAdmin){
            const data = await ProductionData.updateOne({name: "mainpage"}, {imgForData: imgName})
        } 
        cb(null, imgName);
       }
    }
})

const upload = multer({
    storage: storage
})
const uploadMiddeware = require('../middleware/upload');
const { array } = require('../middleware/upload');
// uploadMiddeware.single('imgForData'), This is upload img middleware

route.post('/:adminID/rename_3', async (req, res)=>{
    
   try {
    const user = await User.findById(req.params.adminID)
    if(!user){
        res.status(404).send('Siz tizim foydalanuvchisi emassiz. Iltimos avval ro\'yhatdan o\'ting')
    }else{
        if(user.isAdmin){
            console.log(req.body);
             await ProductionData.updateOne({name: "mainpage"}, {$set: req.body})
            .then(async result=>{
                const data= await ProductionData.findOne({name: "mainpage"})
                res.status(200).render('content/dataForYangiAvlod.ejs', {adminID: req.params.adminID, data, message: "Ma'lumot yangilandi"})
            })
            .catch(err=>{
                console.log(err);
            })
        }else{
            res.status(400).json("Kechirasiz tizim ma'lumotlarini faqat ma'lum shaxslar o'zgartirish huquqiga ega")
        }
    }
   } catch (err) {
    res.status(500).json("Data yangilashda xatolik kuzatildi..."+err)
   }
})

route.post('/:adminID/rename_6',async (req, res)=>{
    try {
        const user = await User.findById(req.params.adminID)
        if(!user){
            res.status(404).send('Siz tizim foydalanuvchisi emassiz. Iltimos avval ro\'yhatdan o\'ting')
        }else{
            if(user.isAdmin){
                 await ProductionData.updateOne({name: "mainpage"}, {$push: {phones: req.body.phones, emails: req.body.emails, admins: req.body.admins}})
                .then(async result=>{
                    const data = await ProductionData.findOne({name: "mainpage"}) 
                    res.status(200).render('content/rename_6.ejs', {adminID: req.params.adminID, data, message: "Ma'lumot yangilandi"})
                })
            }else{
                res.status(400).json("Kechirasiz tizim ma'lumotlarini faqat ma'lum shaxslar o'zgartirish huquqiga ega")
            }
        }
       } catch (err) {
        res.status(500).json("Data yangilashda xatolik kuzatildi..."+err)
       }
})

// delete admin phone number
route.post('/:adminID/rename_6/phone', async (req, res)=>{
    try{
        const user = await User.findById(req.params.adminID);
        if(user){
            if(user.isAdmin){
               const data = await ProductionData.findOne({name: "mainpage"})
                  const index = data.phones.indexOf(req.body.phone)
                  if(index > -1){
                       data.phones.splice(index, 1)
                      await ProductionData.updateOne({name: "mainpage"}, {$set: {phones: data.phones}})
                      .then(()=>{
                         res.status(200).render('content/rename_6.ejs', {adminID: req.params.adminID, data, message: "Ma'lumot yangilandi"})
                      })
                  }
            }else{
                res.status(403).send("Siz admin emassiz")
            }
        }else{
            res.status(404).send('Siz tizim foydalanuvchisi emassiz. Iltimos avval ro\'yhatdan o\'ting')
        }
    }catch(err){
        res.status(500).json("Data o'chirishda xatolik kuzatildi..."+err)
    }
})

route.post('/:adminID/rename_6/email', async (req, res)=>{
    try{
        const user = await User.findById(req.params.adminID);
        if(user){
            if(user.isAdmin){
               const data = await ProductionData.findOne({name: "mainpage"})
                  const index = data.emails.indexOf(req.body.phone)
                  if(index > -1){
                       data.emails.splice(index, 1)
                      await ProductionData.updateOne({name: "mainpage"}, {$set: {emails: data.emails}})
                      .then(()=>{
                        res.status(200).render('content/rename_6.ejs', {adminID: req.params.adminID, data, message: "Ma'lumot yangilandi"})
                     })
                  }
            }else{
                res.status(403).send("Siz admin emassiz")
            }
        }else{
            res.status(404).send('Siz tizim foydalanuvchisi emassiz. Iltimos avval ro\'yhatdan o\'ting')
        }
    }catch(err){
        res.status(500).json("Data o'chirishda xatolik kuzatildi..."+err)
    }
})
route.post('/:adminID/rename_6/admin', async (req, res)=>{
    try{
        const user = await User.findById(req.params.adminID);
        if(user){
            if(user.isAdmin){
               const data = await ProductionData.findOne({name: "mainpage"})
                  const index = data.admins.indexOf(req.body.phone)
                  if(index > -1){
                       data.admins.splice(index, 1)
                      await ProductionData.updateOne({name: "mainpage"}, {$set: {admins: data.admins}})
                      .then(()=>{
                        res.status(200).render('content/rename_6.ejs', {adminID: req.params.adminID, data, message: "Ma'lumot yangilandi"})
                     })
                      .catch(err=>{
                          res.send(err)
                      })
                  }
            }else{
                res.status(403).send("Siz admin emassiz")
            }
        }else{
            res.status(404).send('Siz tizim foydalanuvchisi emassiz. Iltimos avval ro\'yhatdan o\'ting')
        }
    }catch(err){
        res.status(500).json("Data o'chirishda xatolik kuzatildi..."+err)
    }
})


 
route.post('/:adminID/rename_7',async (req, res)=>{
    try {
        const user = await User.findById(req.params.adminID)
        if(!user){
            res.status(404).send('Siz tizim foydalanuvchisi emassiz. Iltimos avval ro\'yhatdan o\'ting')
        }else{
            if(user.isAdmin){
                await ProductionData.updateOne({name: "mainpage"}, {$set: {bizBilanBoglanish: req.body}})
                .then(result=>{
                    res.status(200).render("content/rename_7.ejs", {adminID: req.params.adminID, data: result.bizBilanBoglanish, message: "Ma'lumot yangilandi"})
                })
                .catch(err=>{
                    console.log(err);
                    res.status(500).render("content/rename_7.ejs", {adminID: req.params.adminID, data, message: "Xatolik ma'lumot yangilanishida"})
                })
            }else{
                res.status(400).json("Kechirasiz tizim ma'lumotlarini faqat ma'lum shaxslar o'zgartirish huquqiga ega")
            }
        }
       } catch (err) {
        res.status(500).json("Data yangilashda xatolik kuzatildi..."+err)
       }
})

module.exports = route