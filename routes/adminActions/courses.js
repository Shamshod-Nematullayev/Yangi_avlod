const express = require('express');
const Course = require('../../model/Course');
const ProductionData = require('../../model/ProductionData')
const router = express.Router(),
User = require('../../model/User'),
fs = require('fs'),
multer = require('multer'),
path = require('path')

// Kurslar page
router.get("/",async(req, res)=>{
    const courseData = await Course.find()
    const data = await ProductionData.findOne({name: "mainpage"})
    res.render("courses/index.ejs", {userId: req.session.userId, data, courseData});
})

router.get('/:adminID',async (req, res)=>{
    await User.findById(req.params.adminID)
        .then(async result=>{
            if(result){
                if(result.isAdmin){
                    const courses = await Course.find()
                    res.status(200).render('courses/changeCourses.ejs', {courses, adminID: req.params.adminID, hosting: process.env.DOMAIN})
                }else{
                    res.status(403).send('Siz tizim admini emassiz. Bu sahifaga kirish huquqiga ega emassiz')
                } 
            }else{
                res.status(404).send('Bazada bunday foydalanuvchi topilmadi')
            }
        })
        .catch(
            err=>{
                res.send("Nimadur noto'g'ri ketdi")
            }
        )
    
})

// multer config
const storage = multer.diskStorage({
destination: (req, file, cb)=>{
    cb(null, 'public/img/course');
},
filename: async (req, file, cb)=>{
    
    const user = await User.findById(req.params.id)
    const imgName = Date.now()+path.extname(file.originalname)
    if(user.isAdmin){
        let date = new Date;
        let month = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust','sentyabr', 'oktyabr', 'noyabr', 'dekabr']
        let exc = file.originalname.slice(file.originalname.length-4, file.originalname.length)
        const newCourse = await new Course({
            image: imgName,
            title: req.body.title,
            desc: req.body.desc,
            price: req.body.price,
            demo: req.body.demo
        }
        )
        newCourse.save()            
    } 
    cb(null, imgName);
}
})

const upload = multer({
storage: storage
})

// Yangilik yaratish
router.post('/:id',async (req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(user){ if(user.isAdmin){
            const newCourse = await new Course({
                title: req.body.title,
                desc: req.body.desc,
                price: req.body.price,
                demo: req.body.demo
            })
            await newCourse.save()
                
            res.send(`Saqlandi agar malumotni yuklashda xatolik kuzatilgan bo'lsa malumotni izminit qilish bilan to'g'irlashingiz mumkin<a href="/courses/${req.params.id}"> Orqaga</a>`)
        }else{            
            res.status(400).send('Ukam borib aqling yentgan ishni qil')
        }}else{
            res.status(403).send("User not found")
        }
    } catch (error) {
         console.log(error);
    }
})

router.post('/:id/delete/:teacherID', upload.single('image'),async (req, res)=>{
try {
    const user =await User.findById(req.params.id)
    if(user.isAdmin){
        const teacher =await Course.findById(req.params.teacherID)
        if(!teacher){
            res.status(404).send('Bu idga teng teacher topilmadi')
        }else{
            if(teacher.image){
               try {
                fs.unlink('./public/img/course/'+teacher.image, async (err)=>{
                    if(err){
                        throw err
                    }else{
                        await Course.findByIdAndDelete(req.params.teacherID)
                        .then(
                            res.redirect('/courses/'+req.params.id)
                        )
                       
                    }
                })
               } catch  {
                await Course.findByIdAndDelete(req.params.teacherID)
                .then(
                    res.redirect('/courses/'+req.params.id)
                )
                .catch(
                    res.send('bazadan malumotni ochirishda xatolik').status(500)
                )       
               }
            }else{
                await Course.findByIdAndDelete(req.params.teacherID)
                        .then(
                            res.redirect('/courses/'+req.params.id)
                        )
                        .catch(
                            res.send('bazadan malumotni o\'chirishda xatolik').status(500)
                        )                           
            }
        }
    }else{
        res.status(400).send('Ukam borib aqling yentgan ishni qil')
    }
} catch (error) {
     
}
})

// Yangilik ma'lumotini o'zgartirish
router.post('/:adminID/update/:teacherID',async (req, res)=>{
const user = await User.findById(req.params.adminID)
if(user){
    if(user.isAdmin){
        const news = await Course.findById(req.params.teacherID)
        if(!news){
            res.status(400).send("Bu IDga teng ma'lumot topilmadi")
        }else{
            Course.findByIdAndUpdate(req.params.teacherID, {$set:req.body})
            .then(
                res.redirect('/courses/'+req.params.adminID)
            )
        }
    }else{
        res.status(403).send('Siz admin emassiz bu amalni amalga oshirish huquqiga ega emassiz')
    }
}else{
    res.status(404).send('Bazada bunday foydalanuvchi topilmadi')
}
})

// Kurs ma'lumotiga hususiyat qo'shish
router.post('/:adminID/addskill/:teacherID',async (req, res)=>{
const user = await User.findById(req.params.adminID)
if(user){
    if(user.isAdmin){
        const news = await Course.findById(req.params.teacherID)
        if(!news){
            res.status(400).send("Bu IDga teng ma'lumot topilmadi")
        }else{
            Course.findByIdAndUpdate(req.params.teacherID, {$push: {skills: req.body.skill}})
            .then(
                res.redirect('/courses/'+req.params.adminID)
            )
        }
    }else{
        res.status(403).send('Siz admin emassiz bu amalni amalga oshirish huquqiga ega emassiz')
    }
}else{
    res.status(404).send('Bazada bunday foydalanuvchi topilmadi')
}
})



module.exports = router