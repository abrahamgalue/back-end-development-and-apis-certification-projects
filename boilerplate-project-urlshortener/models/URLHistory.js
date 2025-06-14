const mongoose = require('mongoose')
const Schema = mongoose.Schema

const URLHistory = mongoose.model(
  'URLs',
  new Schema({
    original_url: String,
    short_url: Number,
  })
)

module.exports = URLHistory
