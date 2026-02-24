const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userModel = require("../models/userSchema")
const transporter = require("../config/nodeMailer")

require('dotenv').config()

const signup = async(req,res)=>{
    const {name,email,password}=req.body
    //todo : check regex expression for email here 
    if(!name || !email ||!password){
        return res.status(400).json({message:"Data missing!!"})

    }
    try{
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"User already exists!!"})
        }
        const hashPassword = await bcrypt.hash(password,10);
        const user = new userModel({
            name:name,
            email:email,
            password:hashPassword
        })
        await user.save()
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'7d'})
        res.cookie('token',token,{
            httpOnly:true,
            secure:true,
            sameSite:"None",
            maxAge:7*24*60*60*1000
        })
        return res.status(200).json({message:"user register success",token})
        

    }catch(err){
        return res.status(400).json({message:err.message})
    }

}

const login = async(req,res)=>{
    const {email,password}=req.body
    if(!email || !password){
        return res.status(400).json({message:"Data missing!!"})
    }
    //todo: do email regex for login
    try{
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(400).json({message:"User already exists"})
        }
        const decode = await bcrypt.compare(password,user.password)
        if(!decode){
            return res.status(400).json({message:"Invalid passsword!!"})
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'7d'})
        res.cookie('token',token,{
            httpOnly:true,
            secure:true,
            sameSite:"None",
            maxAge:7*24*60*60*1000
            
        })
        return res.status(200).json({message:"login success",token})

    }catch(err){
        return res.status(400).json({message:err.message})
    }
}


const logout = async(req,res)=>{
    try{
        res.clearCookie("token",{
            httpOnly:true,
            secure:process.env.NODE_ENV ==='production',
            sameSite:process.env.NODE_ENV ==='production' ? 'none' : 'strict',
        })
        return res.status(200).json({message:"Logout successfully"})

    }catch(err){
        return res.status(400).json({message:err.message})
    }
}

const emailVerify = async(req,res)=>{
    const {email}=req.body
    if(!email){
        return res.status(400).json({message:"Invalid email id"})
    }
    try{
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(400).json({message:"User not found! Please signup"})
        }
        const resetToken = crypto.randomBytes(32).toString("hex")
        user.resetToken = resetToken
        user.resetTokenExpires = Date.now() + 15 * 60 * 1000
        await user.save()
        //todo : integration mail part of code to send the mail


        //mail sending code below
        const resetLink = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`

        console.log(resetLink)
        const mailOptions = {
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Reset Password link",
            text: `Hi buddy please click this link to change the password ${resetLink}`
        }
        console.log("mail sending start")
        
        await transporter.sendMail(mailOptions)
        console.log("mail sent succes")
        return res.status(200).json({ resetToken,message: "mail sent successfully" })
    }catch(err){
        console.log(err.message)
        return res.status(400).json({message:err.message})
        
    }
}


const resetPassword = async(req,res)=>{
    const {token,password}=req.body
    if(!token || !password){
        return res.status(401).json({message:"Data  missing"})
    }
    try{
        const user = await userModel.findOne({
            resetToken : token,
            resetTokenExpires:{$gt:Date.now()}
        })
        if(!user){
            return res.status(500).json({message:"Invalid token"})
        }
        const hashPassword = await bcrypt.hash(password,10)
        user.password = hashPassword
        user.resetToken=null
        user.resetTokenExpires=null
        await user.save()
        return res.status(200).json({message:"password changed sucess"})
    }catch(err){
        return res.status(400).json({message:err.message})
    }
}

module.exports={signup,login,logout,emailVerify,resetPassword}