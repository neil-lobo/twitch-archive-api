const { json } = require("express")
const express = require("express")
const cors = require("cors")
const {MongoClient} = require("mongodb")

require("dotenv").config()
const app = express()
app.use(express.json())
app.use(cors())
const client = new MongoClient(process.env.DB)
let db

function log(str) {
    const date = new Date()
    console.log(`(UTC/GMT${(-1)*date.getTimezoneOffset()/60}) ${date.toLocaleString()} |> ${str}`)
}

function logVerbose(str) {
    if (process.env.LOG == "verbose") {
        log(str)
    }
}

client.connect((err, client) => {
    if (err) throw err

    db = client.db("twitch-archive")
    log("[DB] CONNECTED")

    app.listen(process.env.PORT || 3000, () => {
        log(`[EXPRESS] Listening on: ${process.env.PORT || 3000}`)
    })
})

app.get("/streamers", async (req, res) => {
    logVerbose("GET /streamers")
    let streamers = {}

    const collection = db.collection("streamers")
    const cursor = await collection.find({}, {projection: {_id: 0}})
    for (let i = 0; i < (await cursor.count()); i++) {
        streamers = Object.assign(await cursor.next(), streamers)
    }

    res.json(streamers)
})

app.post("/streamers", async (req, res) => {
    logVerbose("POST /streamers")

    const collection = db.collection("streamers")
    collection.insertOne(req.body)
        .then(() => {
            log("[DB] New Streamer Added")
            res.status(201).send()
        })
        .catch(err => {
            res.status(500).json(err)
        })
})

app.get("/vods", async (req, res) => {
    logVerbose("GET /vods")
    let vods = []

    const collection = db.collection("vods")
    const cursor = await collection.find({}, {projection: {_id: 0}})
    for (let i = 0; i < (await cursor.count()); i++) {
        vods.push(await cursor.next())
    }

    res.json(vods)
})

app.get("/vods/:user_id", async (req, res) => {
    logVerbose(`GET /vods/${req.params.user_id}`)
    let vods = []

    const collection = db.collection("vods")
    const cursor = await collection.find({"user_id": req.params.user_id}, {projection: {_id: 0}})
    for (let i = 0; i < (await cursor.count()); i++) {
        vods.push(await cursor.next())
    }

    res.json(vods)
})

app.post("/vods", async (req, res) => {
    logVerbose("POST /vods")

    const collection = db.collection("vods")
    collection.insertOne(req.body)
        .then(() => {
            log("[DB] New vod data logged")
            res.status(201).send()
        })
        .catch(err => {
            res.status(500).json(err)
        })
})

app.get("/vod/:type/:id", async (req, res) => {
    const types = ["stream_id", "vod_id"]
    if (!types.includes(req.params.type)) {
        res.stats(400).send()
        return
    }
    logVerbose(`GET /vod/${req.params.type}/${req.params.id}`)

    const collection = db.collection("vods")
    let data

    if (req.params.type == "stream_id") {
        data = await collection.findOne({"stream_id": req.params.id})
    } else {
        data = await collection.findOne({"id": req.params.id})
    }

    res.json(data)
})
