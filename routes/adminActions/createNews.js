const res = require('express/lib/response');
const { title } = require('process');

// require moduls
const express = require('express'),
    router = express.Router(),
    User = require('../../model/User'),
    News = require('../../model/News'),
    fs = require('fs'),
    multer = require('multer'),
    path = require('path')

    // multer config
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'public/img/news');
    },
    filename: async (req, file, cb)=>{
        
        const user = await User.findById(req.params.id)
        const imgName = Date.now()+path.extname(file.originalname)
        if(user.isAdmin){
            let date = new Date;
            let month = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust','sentyabr', 'oktyabr', 'noyabr', 'dekabr']
            let exc = file.originalname.slice(file.originalname.length-4, file.originalname.length)
            const news = await new News({
                image: imgName,
                title: req.body.title,
                desc: req.body.desc,
                date:  date.getDate()+' '+month[date.getMonth()],
                year: date.getFullYear(),
                link: req.body.link
            }
            )
            news.save()            
        } 
        cb(null, imgName);
    }
})

const upload = multer({
    storage: storage
})

// Yangilik yaratish
router.post('/:id', upload.single('image'), (req, res)=>{
    res.send(`Saqlandi agar malumotni yuklashda xatolik kuzatilgan bo'lsa malumotni izminit qilish bilan to'g'irlashingiz mumkin<a href="/createNews/${req.params.id}"> Orqaga</a>`)
})
router.post('/:id/delete/:newsID', upload.single('image'),async (req, res)=>{
    try {
        const user =await User.findById(req.params.id)
        if(user.isAdmin){
            const news = await News.find()
            const newsOne =await News.findById(req.params.newsID)
            if(!newsOne){
                res.status(404).send('Bu idga teng malumot topilmadi')
            }else{
                if(newsOne.image){
                   try {
                    fs.unlink('./public/img/news/'+newsOne.image, async (err)=>{
                        if(err){
                            throw err
                        }else{
                            await News.findByIdAndDelete(req.params.newsID)
                            .then(
                                res.redirect('/createNews/'+req.params.id)
                            )                           
                        }
                    })
                   } catch  {
                    await News.findByIdAndDelete(req.params.newsID)
                    .then(
                        res.redirect('/createNews/'+req.params.id)
                    )
                    .catch(
                        res.send('bazadan malumotni ochirishda xatolik').status(500)
                    )       
                   }
                }else{
                    await News.findByIdAndDelete(req.params.newsID)
                            .then(
                                res.redirect('/createNews/'+req.params.id)
                            )
                            .catch(
                                res.send('bazadan malumotni ochirishda xatolik').status(500)
                            )                           
                }
            }
        }else{
            res.status(400).send('Ukam borib aqling yentgan ishni qil')
        }
    } catch (error) {
         if(error) res.status(500).send(error)
    }
})

// Yangilik ma'lumotini o'zgartirish
router.post('/:adminID/update/:newsID',async (req, res)=>{
    const user = await User.findById(req.params.adminID)
    if(user){
        if(user.isAdmin){
            const news = await News.findById(req.params.newsID)
            if(!news){
                res.status(400).send("Bu IDga teng ma'lumot topilmadi")
            }else{
                News.findByIdAndUpdate(req.params.newsID, {$set:req.body})
                .then(
                    res.redirect('/createNews/'+req.params.adminID)
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