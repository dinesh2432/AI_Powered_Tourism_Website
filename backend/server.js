const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require('cookie-parser')
const authroute = require("./src/routes/auth.routes")
const connectDb = require("./src/config/db")
const port = process.env.PORT || 3000
require('dotenv').config

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(cookieParser())


app.get("/",(req,res)=>{
    res.send("hello")
})


app.use("/api/auth",authroute)


connectDb()
app.listen(port,()=>{
    console.log(`Server running on the port ${port}`)
})






