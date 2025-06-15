const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/User')
const Exercise = require('./models/Exercise')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI)

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/api/users', (req, res) => {
  User.find().then(data => res.send(data))
})

app.post('/api/users', (req, res) => {
  const { username } = req.body

  User.create({ username }).then(data =>
    res.send({ username: data.username, _id: data._id })
  )
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id
  const { description, duration, date } = req.body
  const exerciseDate = date ? new Date(date).toDateString() : new Date()

  User.findById(userId).then(user => {
    if (!user) return res.status(400).send('User not found')

    Exercise.create({
      userId: user._id,
      username: user.username,
      description,
      duration: +duration,
      date: exerciseDate,
    }).then(exercise => {
      res.json({
        _id: user._id,
        username: user.username,
        date: exercise.date,
        duration: exercise.duration,
        description: exercise.description,
      })
    })
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id
  const { from, to, limit } = req.query

  User.findById(userId).then(user => {
    if (!user) return res.status(400).send('User not found')

    const query = { userId }
    if (from || to) {
      query.date = {}
      if (from) query.date.$gte = new Date(from)
      if (to) query.date.$lte = new Date(to)
    }

    Exercise.find(query).then(exercises => {
      let logs = exercises.sort((a, b) => new Date(a.date) - new Date(b.date))

      if (limit) logs = logs.slice(0, parseInt(limit))

      res.json({
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log: logs.map(exercise => ({
          description: exercise.description,
          duration: exercise.duration,
          date: new Date(exercise.date).toDateString(),
        })),
      })
    })
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
