const companyDAO = require('../../dao/company.dao');
const { STATUS } = require('../../utils/status.utils');

const signup = async (req, res) => {
  const { company } = req.body;
  try {
    const existingCompany = await companyDAO.findOne({ 'company.email': company.email })
    if (existingCompany) {
      return res.status(STATUS.BAD_REQUEST).json({ message: 'Email already registered' })
    }

    await companyDAO.insertOne({ company })

    res.status(STATUS.CREATED).json({ message: 'Signup successful' })
  } catch (error) {
    console.error(error)
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' })
  }
}

module.exports = {
  signup,
}
