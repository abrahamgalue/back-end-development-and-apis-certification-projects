require('dotenv').config()
const express = require('express')
const dns = require('node:dns')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const URLHistory = require('./models/URLHistory')

// Basic Configuration
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({ extended: true }))

// Connect to db
mongoose.connect(process.env.MONGODB_URI)

app.use('/public', express.static(`${process.cwd()}/public`))

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' })
})

let id = 0

URLHistory.find()
  .exec()
  .then(x => (id = x.length))
  .catch(err => console.log(err))

app.post('/api/shorturl', function (req, res) {
  const { url } = req.body
  let hostname

  try {
    hostname = new URL(url).hostname
  } catch (e) {
    return res.json({ error: 'invalid url' })
  }

  dns.lookup(hostname, (err, _) => {
    if (err) return res.json({ error: 'invalid url' })

    URLHistory.create({ original_url: url, short_url: id++ }).then(x =>
      res.send({ original_url: x.original_url, short_url: x.short_url })
    )
  })
})

app.get('/api/shorturl/:id', (req, res) => {
  const { id } = req.params

  URLHistory.findOne({ short_url: +id })
    .exec()
    .then(data => {
      if (!data) {
        return res.json({ error: 'invalid url' })
      }
      return res.redirect(data.original_url)
    })
    .catch(err => {
      res.status(500).json({ error: 'server error' })
    })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
