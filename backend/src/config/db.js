const mongoose = require("mongoose")
require('dotenv').config()


const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Mongodb connected successfuly")
    }catch(err){
        console.log(err.message)
    }
}


module.exports=connectDb

