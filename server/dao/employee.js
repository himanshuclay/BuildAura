const Employee = require('../schema/employee')

async function findOne(query, projection={}, options={}) {
  return await Employee.findOne(query, projection, options)
}
async function find(query, projection={}, options={}) {
  return await Employee.find(query, projection, options)
}
async function insertOne(query, projection={}, options={}) {
  return await Employee.insertOne(query, projection, options)
}
async function findOneAndUpdate(query, projection={}, options={}) {
  return await Employee.findOneAndUpdate(query, projection, options)
}

module.exports = {
  find,
  findOne,
  insertOne,
  findOneAndUpdate,
}