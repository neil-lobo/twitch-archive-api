const express = require("express")
const {MongoClient} = require("mongodb")

require("dotenv").config()
const app = express()
app.use(express.json())
const client = new MongoClient(process.env.DB)
let db

client.connect((err, client) => {
    if (err) throw err

    db = client.db("twitch-archive")
    console.log("[DB] CONNECTED")

    app.listen(process.env.PORT || 3000, () => {
        console.log(`[EXPRESS] Listening on: ${process.env.PORT || 3000}`)
    })
})

app.get("/streamers", async (req, res) => {
    console.log("GET /streamers")
    let streamers = []

    const collection = db.collection("streamers")
    const cursor =  await collection.find({}, {projection: {_id: 0}})

    for (let i = 0; i < (await cursor.count()); i++) {
        streamers.push(await cursor.next())
    }

    res.json(streamers)
})

app.post("/streamers", async (req, res) => {
    console.log("POST /streamers")

    const collection = db.collection("streamers")
    collection.insertOne(req.body)
        .then(() => {
            console.log("[DB] New Streamer Added")
            res.status(201).send()
        })
        .catch((err) => {
            res.status(500).json(err)
        })
})