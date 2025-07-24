const User = require('../../model/superAdmin/company.model')

async function findOne(query, projection={}, options={}) {
  return await User.findOne(query, projection, options)
}
async function insertOne(query, projection={}, options={}) {
  return await User.insertOne(query, projection, options)
}

module.exports = {
  findOne,
  insertOne,
}
