const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    name: { type: String, requred: true },
    email: { type: String, required: true, unique: true },
    signature: { type: String, required: true },
})

module.exports = mongoose.model('Employee', employeeSchema)