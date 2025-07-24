const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  company: {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    domain: { type: String, required: true },
    color: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      country: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
  },
  password: { type: String },
  status: { type: String, enum: ['ACTIVE', 'IN_ACTIVE'], default: 'ACTIVE'},
  type: { type: String, enum: ['ADMIN', 'SUPER_ADMIN']},
})

module.exports = mongoose.model('User', userSchema)
