const express = require("express")
const { signup, login, logout } = require("../controllers/auth.controllers")
const authroute = express.Router()


authroute.post("/signup",signup)
authroute.post("/login",login)
authroute.post("/logout",logout)


module.exports=authroute