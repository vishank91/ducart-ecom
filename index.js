const express = require("express")
const cors = require("cors")
const path = require("path")

require("dotenv").config()

require("./db_connect")
const Router = require("./routes/index")

const app = express()
app.use(cors())

app.use(express.json())
app.use("/public",express.static("public")) //used to server public folder
app.use(express.static(path.join(__dirname, 'build')))

app.use("/api", Router)
app.use('*', express.static(path.join(__dirname, 'build')))

let PORT = process.env.PORT || 8000
app.listen(PORT, console.log(`Server is Running at http://localhost:${PORT}`))