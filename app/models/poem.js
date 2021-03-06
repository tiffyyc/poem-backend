const mongoose = require('mongoose')

const poemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  writer: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
}
)

module.exports = mongoose.model('Poem', poemSchema)
