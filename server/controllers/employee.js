const employeeDAO = require('../dao/employee')
const { MESSAGE } = require('../utils/message')
const { STATUS } = require('../utils/status')

const save = async (req, res) => {
  try {
    const { name, email, _id } = req.body
    if (!email) {
      return res.status(STATUS.BAD_REQUEST).json({ message: 'Email is required' })
    }
    const signatureFile = req.file;
    const employee = {
      name,
      email,
      signature: signatureFile ? `/uploads/${signatureFile.filename}` : null,
    }
    if(_id){
      await employeeDAO.findOneAndUpdate({_id}, {...employee});
      return res.status(STATUS.OK).json({ message: 'Employee updated successfully' })
    }else{
      const existing = await employeeDAO.findOne({ email })
      if (existing) {
        return res.status(STATUS.BAD_REQUEST).json({ message: 'Email already registered' })
      }
      await employeeDAO.insertOne(employee)
      return res.status(STATUS.CREATED).json({ message: 'Employee saved successfully' })
    }
  } catch (error) {
    console.error('Error saving employee:', error)
    return res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGE.SERVER_ERROR })
  }
}

const fetch = async (req, res) => {
  try {
    const list = await employeeDAO.find();
    return res.status(STATUS.OK).json({ list: list, message: 'Employee saved successfully' })
  } catch (error) {
    console.error('Error saving employee:', error)
    return res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGE.SERVER_ERROR })
  }
}

module.exports = { save, fetch }
