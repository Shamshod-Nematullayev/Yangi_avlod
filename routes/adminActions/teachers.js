const express = require('express');
const Teacher = require('../../model/Teacher');
const ProductionData = require('../../model/ProductionData')
const router = express.Router(),
User = require('../../model/User'),
fs = require('fs'),
multer = require('multer'),
path = require('path')


router.get('/',async (req, res)=>{
    const teachersData = await Teacher.find()
    const data = await ProductionData.findOne({name: "mainpage"})
    res.render("teachers/index.ejs", {teachersData, data, userId: req.session.userId})
})

router.get('/:adminID',async (req, res)=>{
    await User.findById(req.params.adminID)
        .then(async result=>{
            if(result){
                if(result.isAdmin){
                    const teachers = await Teacher.find()
                    res.status(200).render('teachers/teachersChange.ejs', {teachers, adminID: req.params.adminID, hosting: process.env.DOMAIN})
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
    cb(null, 'public/img/team');
},
filename: async (req, file, cb)=>{
    
    const user = await User.findById(req.params.id)
    const imgName = Date.now()+path.extname(file.originalname)
    if(user.isAdmin){
        let date = new Date;
        let month = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust','sentyabr', 'oktyabr', 'noyabr', 'dekabr']
        let exc = file.originalname.slice(file.originalname.length-4, file.originalname.length)
        const teacher = await new Teacher({
            image: imgName,
            title: req.body.title,
            desc: req.body.desc,
            date:  date.getDate()+' '+month[date.getMonth()],
            year: date.getFullYear(),
            email: req.body.email,    
            telegram: req.body.telegram,
            instagram: req.body.instagram,
            phone: req.body.phone
        }
        )
        teacher.save()            
    } 
    cb(null, imgName);
}
})

const upload = multer({
storage: storage
})

// Yangilik yaratish
router.post('/:id', upload.single('image'), (req, res)=>{
res.send(`Saqlandi agar malumotni yuklashda xatolik kuzatilgan bo'lsa malumotni izminit qilish bilan to'g'irlashingiz mumkin<a href="/teachers/${req.params.id}"> Orqaga</a>`)
})

router.post('/:id/delete/:teacherID', upload.single('image'),async (req, res)=>{
try {
    const user =await User.findById(req.params.id)
    if(user.isAdmin){
        const teacher =await Teacher.findById(req.params.teacherID)
        if(!teacher){
            res.status(404).send('Bu idga teng teacher topilmadi')
        }else{
            if(teacher.image){
               try {
                fs.unlink('./public/img/team/'+teacher.image, async (err)=>{
                    if(err){
                        throw err
                    }else{
                        await Teacher.findByIdAndDelete(req.params.teacherID)
                        .then(
                            res.redirect('/teachers/'+req.params.id)
                        )
                       
                    }
                })
               } catch  {
                await Teacher.findByIdAndDelete(req.params.teacherID)
                .then(
                    res.redirect('/teachers/'+req.params.id)
                )
                .catch(
                    res.send('bazadan malumotni ochirishda xatolik').status(500)
                )       
               }
            }else{
                await Teacher.findByIdAndDelete(req.params.teacherID)
                        .then(
                            res.redirect('/teachers/'+req.params.id)
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
        const news = await Teacher.findById(req.params.teacherID)
        if(!news){
            res.status(400).send("Bu IDga teng ma'lumot topilmadi")
        }else{
            Teacher.findByIdAndUpdate(req.params.teacherID, {$set:req.body})
            .then(
                res.redirect('/teachers/'+req.params.adminID)
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