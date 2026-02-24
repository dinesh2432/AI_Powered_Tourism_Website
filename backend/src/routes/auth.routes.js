const express = require("express")
const { signup, login, logout, emailVerify, resetPassword } = require("../controllers/auth.controllers")
const authroute = express.Router()


authroute.post("/signup",signup)
authroute.post("/login",login)
authroute.post("/logout",logout)
authroute.post("/emailVerify",emailVerify)
authroute.post("/resetPassword",resetPassword)


module.exports=authroute