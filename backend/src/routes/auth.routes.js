const express = require("express")
const { signup } = require("../controllers/auth.controllers")
const authroute = express.Router()


authroute.post("/signup",signup)


module.exports=authroute