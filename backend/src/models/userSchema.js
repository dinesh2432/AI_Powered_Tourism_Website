const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
    },
    resetToken:{
        type:Date,
        default:null,
    },
    resetTokenExpires:{
        type:Date,
        default:null
    }
},{timestamps:true})

const userModel = mongoose.models.User || mongoose.model('User',userSchema)
module.exports=userModel