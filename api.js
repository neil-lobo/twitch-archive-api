const express = require("express")
const {MongoClient} = require("mongodb")

require("dotenv").config()
const app = express()
const client = new MongoClient(process.env.DB)
let db

client.connect((err, database) => {
    if (err) throw err

    console.log("[DB] CONNECTED")
    db = database

    app.listen(process.env.PORT || 3000, () => {
        console.log(`[EXPRESS] Listening on: ${process.env.PORT || 3000}`)
    })
})