const CountGet = require('../model/CountGet');
module.exports = async (req, res, next)=>{
    let date = new Date
    try {
        const today =await CountGet.findOne({date:date.getDate()+'/' +(date.getMonth()+1)+'/'+date.getFullYear()})
    .then(async result=>{
        let visits = result.visitHomePage;
        visits++
        await result.updateOne({visitHomePage: visits})
    })
} catch(err){
    
               const newCount= await new CountGet({
                   visitHomePage:1,
                   date: date.getDate()+'/' +(date.getMonth()+1)+'/'+date.getFullYear()
               })
               console.log(newCount);
               await newCount.save()
           
         
    }
        
    
        

    next()

    date.getDate()+'/' +(date.getMonth()+1)+'/'+date.getFullYear();
}