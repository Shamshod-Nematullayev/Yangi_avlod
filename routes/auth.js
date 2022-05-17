const router = require('express').Router();

// models
const User = require('../model/User');
const UserVerification = require('../model/UserVerification')
const ResetPass = require('../model/ResetPass')


const bcrypt = require('bcrypt');
const { send } = require('express/lib/response');
const path = require('path');
// email handler
const nodemailer = require('nodemailer');

// unique string
const {v4: uuidv4} = require('uuid');
const req = require('express/lib/request');
const { default: mongoose } = require('mongoose');
const session = require('express-session');

// env varible require
require('dotenv').config();

// nodemailer stuff
let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.AUTH_EMAIL, 
        pass: process.env.AUTH_PASS
    },
    tls: { 
        rejectUnauthorized: false
    } 
}) 
 
// testing succes
transporter.verify((error, succes)=>{
    if(error){
        console.log('Error transporter');
        console.log(error)
    }else{
        console.log("We are succesfull login your email");
    }
    
}) 
 

// REGISTER

router.post('/register', async (req,res)=>{
    
    try{
        // generate a new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // creat newUser
        const newUser = await new User({
            username : req.body.username,
            email: req.body.email,
            password: hashedPassword,
            verified : false
        })

        //save user and respond
        await newUser.save()
          .then(result=>{
            //   handle account verification
            sendVerificationEmail(result, res);
        })
          ;
    }catch(err){
        if(err.keyPattern.username ===1){
            return res.send("Bunday foydalanuvchi mavjud boshqa username kiriting! <a href='/login'>Orqaga</a>")
        }else if(err.keyPattern.email ===1){
            return res.send("Bu email allaqachon ro'yhatdan o'tgan! <a href='/login'>Orqaga</a>")
        }
        res.status(500).json(err)
    }
});

// send verification email
const sendVerificationEmail = ({_id, email}, res)=>{
    // url to be used in the email
    const currentUrl = process.env.DOMAIN+'/'

    const uniqueString = uuidv4() + _id;

    // mail options
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Verify Your Email',
        html: `
        <p>Emailingizni tasdiqlash uchun shu yerga -> <b><a href="${currentUrl+'api/auth/verify/' + _id +'/'+ uniqueString}">bosing</a></b>. Bu link 6 soat davomida aktiv bo'ladi</p>
        `
    }
    // hash the uniqueString
    const salt = 10;
    bcrypt
    .hash(uniqueString, salt)
    .then(
        hashedUniqueString =>{
            const newVerification = new UserVerification({
                userId: _id,
                uniqueString: hashedUniqueString,
                createdAt : Date.now(),
                expiresAt : Date.now() +21600000
            });
        newVerification.save() 
        .then(
            transporter.sendMail(mailOptions)
            .then(()=>{
                res.send('Verification send your email')
            })
            .catch(err=>{
            console.log(err);
            res.send('Cound send verificaion email. Please leter')
            })
        )
        .catch(err=>{
            console.log(err);
            res.send('Cound save verificaion email. Please leter')
        })
        }
    )
    .catch(()=>{
        res.send(
            "An error occured while hashing email data!"
        )
    })
}

// verify email
router.get("/verify/:userId/:uniqueString", (req, res)=>{
    let {userId, uniqueString} = req.params;

    UserVerification.findOne({userId: userId})
    .then(result=>{
        console.log(result);
        if(result){
            // user verification record exicts so we  proceed
            const {expiresAt} = result;
            const hashedUniqueString = result.uniqueString;

            if(expiresAt < Date.now()){
                UserVerification.deleteOne({userId})
                .then(result=>{
                    User.findByIdAndDelete(userId)
                    .then(()=>{
                        let message = "Link has been expired. Please sign up or login again";
                        res.redirect(`/api/auth/verified/error=true&message=${message}`);
                    })
                    .catch(err=>{
                        let message = "clearing user with expired unique string failed";
                        res.redirect(`/api/auth/verified/error=true&message=${message}`);
                    })
                })
                .catch(err=>{
                    console.log(err);
                    let message = "eski verify";
                    res.redirect(`/api/auth/verified/error=true&message=${message}`);
                })
            }else{
                // valid record exicts so we validate the user String
                // first compere the hashed uniqueString

                bcrypt.compare(uniqueString, hashedUniqueString)
                .then(result=>{
                    if(result){
                        // strings match
                        User.updateOne({_id: userId}, {verified: true})
                        .then(()=>{
                            UserVerification.deleteOne({userId})
                            .then(()=>{
                                res.sendFile(path.join(__dirname, './../views/verified.html'));
                            })
                            .catch(err=>{
                                console.log(err);
                                let message = "An error occured while finalizing seccessful verification.";
                                res.redirect(`/api/auth/verified/error=true&message=${message}`);
                            })
                        })
                        .catch(err=>{
                            console.log(err);
                            let message = "An error occured while updating user record to show verified.";
                            res.redirect(`/api/auth/verified/error=true&message=${message}`);
                        })
                    }else{
                        // existing record but incorrect verification details passed.
                        let message = "Invalid verification details passed. Check your inbox.";
                        res.redirect(`/api/auth/verified/error=true&message=${message}`);
                    }
                })
                .catch(err=>{
                    let message = "An error when comparing unique strings";
                    res.redirect(`/api/auth/verified/error=true&message=${message}`);
                })
            }
        }else{
            let message = "Account record doesn't exist";
            res.redirect(`/api/auth/verified/error=true&message=${message}`);  
        }
    })
    .catch(err=>{
        console.log(err);
        let message = "An error occured while cheking for exiting user verification record";
        res.redirect(`/api/auth/verified/error=true&message=${message}`);
    })
})

// verified page router
router.get("/verified", (req, res)=>{
    res.sendFile(path.join(__dirname, './../views/verified.html'))
})






// LOGIN
router.post('/login', async (req, res)=>{
     try{
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).send("user not found")

        if(user.verified){
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if(!validPassword){
                res.status(400).json("wrong password");
            }else{
                req.session.userId = user._id
                res.status(200).redirect("/");
            }
        }else{
            res.status(403).json("Bu email verifikatsiya qilinmagan. Email pochtangizni tekshiring...");
        }
     }catch(err){
        console.log(err);
      }
})


// Tizimga Admin Bo'lib kirish
router.post('/loginAdmin', async (req, res)=>{
    try{
       const user = await User.findOne({email: req.body.email});
       if(!user)  {res.status(404).render('adminLoginMsg.ejs',{message:"user not found"} )}

       if(user.verified){
           if(user.isAdmin){
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            !validPassword && res.status(400).json("wrong password");
    
            req.session.userId = user._id
            res.status(200).render('content.ejs', {adminID: user._id, hosting: process.env.DOMAIN});
           }else{
               res.status(403).render("adminLogin.ejs",{message:"Siz tizimga admin sifatida kirish huquqiga ega emassiz"});
           }
       }else{
           res.status(403).render("adminLogin.ejs",{message:"Bu email verifikatsiya qilinmagan. Email pochtangizni tekshiring..."});
       }
    }catch(err){
       res.status(500).render("adminLogin.ejs", {message:err});
    }
})


router.post('/forgotPassword', async (req, res)=>{
    const {email, redirectUrl} = req.body;
    // Ko'rsatilgan email mavjudmi?
    await User.find({email})
        .then(
            data=>{
                if(data.length){

                    // Email verivikatsiya bo'ganmi?
                  if(!data[0].verified)  {
                    res.json({
                        status: "FAILED",
                        message: "Bu email manzili tasdiqlanmagan. Email pochtani tekshiring"
                    })
                  }else{
                    // Verifikatsiya bo'libdi xo'sh
                    sendResetEmail(data[0], redirectUrl, res);
                  }

                }else{
                    res.json({
                        status: "FAILED",
                        message: "Bazada bunday email manzili aniqlanmadi..."
                    })
                }
            }
        )
        .catch(err=>{
            console.log(err);
            res.json({
                status: "FAILED",
                message: "Mavjud foydalanuvchini tekshirishda xatolik yuz berdi..."
            }) 
        })
})

// Passwordni yangilash mavzusida emailga xabar yuborish funksiyasi
function sendResetEmail({_id, email}, redirectUrl, res) {
    const resetString = uuidv4() + _id;

    // Birinchi navbatda bu manzil parolini yangilash haqidagi yozuvlarni tozalaymiz
    ResetPass
        .deleteMany({userId: _id})
        .then(
            async result=>{
                // ResetEmail tozalandi
                // Endi habarni yuboramiz

                // mail options
                const mailOptions = {
                    from: process.env.AUTH_EMAIL,
                    to: email,
                    subject: 'Password Reset',
                    html: `
                    
<!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                          <a href="${process.env.OLIY_ONG}" title="logo" target="_blank">
                            <img width="60" src="${process.env.DOMAIN}/Images/Logo.png" title="logo" alt="logo">
                          </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            Parolni o'chirish uchun shu yerga -<a>bosing</a>. Bu link 1 soat davomida aktiv bo'ladi. Agar parolni yangilash niyatiz bo'lmasa bu linkdan foydalanmang
                                        </p>
                                        
                                        <a href=${redirectUrl+'forgotpass/' + _id +'/'+ resetString}
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong><a href="${process.env.OLIY_ONG}">Oliy Ong</a> tomonidan yaratildi</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>

</html>
                    `
                }

                // resetString ni shifrlash
                const saltRounds = 10;
                await bcrypt.hash(resetString, saltRounds)
                    .then(async hashedResetString=>{
                        //bazaga parolni yangilash so'rovini yuklash
                        const newResetPass = new ResetPass({
                            userId: _id,
                            resetString: hashedResetString,
                            createdAt: Date.now(),
                            expiresAt: Date.now() + 3600000
                        })

                        await newResetPass.save()
                            .then(
                                await transporter.sendMail(mailOptions)
                                    .then(()=>{
                                        // reset email jo'natildi va ma'lumot saqlandi
                                        res.json({
                                            status: "PENDING",
                                            message: "Password reset email send"
                                        })
                                    })
                                    .catch(err=>{
                                        console.log(err);
                                        res.json({
                                            status: "FAILED",
                                            message: "Emailga xabar yuborib bo'lmadi. Tekshiib ko'rib qaytadan urinib ko'ring"
                                        })
                                    })
                            )
                            .catch(err=>{
                                console.log(err);
                                res.json({
                                    status: "FAILED",
                                    message: "resest password DBga yuklashda error kuzatildi"
                                })
                            })
                    })
                    .catch(err=>{
                        console.log(err);
                        res.json({
                            status: "FAILED",
                            message: "resetStringni shifrlashda error kuzatildi"
                        })
                    })
            }
        )
        .catch(
            err=>{
                console.log(err); 
                res.json({
                    status: "FAILED",
                    message: "Password reset ma'lumotlari yo'q..."
                })
            }
        )
}

// Passwordni yangilab yuborish
router.post('/resetPassword', async (req, res)=>{
    let {userId, resetString, newPassword} = req.body;

    await ResetPass.find({userId})
        .then(async result=>{
            if(result.length > 0){
                // Reset Pass ma'lumoti topilsa

                const {expiresAt} = result[0];
                const hashedResetString = result[0].resetString;

                if(expiresAt < Date.now()){
                    await ResetPass.deleteOne({userId})
                        .then(()=>{
                            //  Password reset ma'lumotlari muvaffaqqiyatli o'chirildi
                            res.json({
                                status: "FAILED",
                                message: "Reset Password olib tashlandi chunki u eskirgan..."
                            })
                        })
                        .catch(err=>{
                            console.log(err);
                            res.json({
                                status: "FAILED",
                                message: "Password reset ma'lumotlarini o'chirishda xatolik..."
                            })
                        })
                }else{
                    // Password reset validatsiyadan o'tdi

                    // ====|1|=== resetString ma'lumotini taqqoslaymiz
                    bcrypt.compare(resetString, hashedResetString)
                        .then((result)=>{
                            if(result){
                                // ResetPass tekshirildi
                                // yangi parolni shifrlaymiz

                                bcrypt.hash(newPassword, 10)
                                    .then(hashedPassword=>{
                                        // user parolini yangilash
                                        User
                                            .updateOne({_id: userId}, {password: hashedPassword})
                                            .then(()=>{
                                                // Yangilash yakunlandi. Endi ResetPass ma'lumotini o'chirib tashlaymiz
                                                ResetPass
                                                    .deleteOne({userId})
                                                    .then(()=>{
                                                        // Ma'lumot o'chirilib User yangilandi
                                                        res.json({
                                                            status: "SUCCESS",
                                                            message: "Sizning parolingiz muvaffaqqiyatli o'zgartirildi"
                                                        })
                                                    })
                                                    .catch(err=>{
                                                        console.log(err);
                                                        res.json({
                                                            status: "FAILED",
                                                            message: "KAPITAN Password reset ma'lumotlarini o'chirib tashlashda xatolik kuzatildi..."
                                                        })
                                                    })
                                            })
                                            .catch(err=>{
                                                console.log(err);
                                                res.json({
                                                    status: "FAILED",
                                                    message: "User ma'lumotlarini yangilashda xatolik kuzatildi..."
                                                })
                                            })
                                    })
                                    .catch(err=>{
                                        console.log(err);
                                        res.json({
                                            status: "FAILED",
                                            message: "Password reset ma'lumotlarini shifrlashda..."
                                        })
                                    })
                            }else{
                                // ResetPass string noto'g'ri
                                res.json({
                                    status: "FAILED",
                                    message: "Password reset ma'lumotlari noto'g'ri..."
                                })
                            }
                        })
                        .catch(err=>{
                            console.log(err);
                            res.json({
                                status: "FAILED",
                                message: "Reset String ma'lumotini shifrini yechishda xatolik..."
                            })
                        })

                }
            }else{
                // Reset Pass ma'lumoti topilmasa
                res.json({
                    status: "FAILED",
                    message: "Password reset ma'lumotlari yo'q..."
                })
            }
        })
        .catch(err=>{
            console.log(err); 
                res.json({
                    status: "FAILED",
                    message: "Password reset ma'lumotlari izlashda xatolik..."
                })
        })
})

module.exports = router;
