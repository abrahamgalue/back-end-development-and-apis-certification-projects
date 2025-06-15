const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Exercise = mongoose.model(
  'Exercise',
  new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: String,
    description: String,
    duration: Number,
    date: String,
  })
)

module.exports = Exercise
