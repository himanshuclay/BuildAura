const { ROLE, ROLE_STATUS } = require('../../constant/superAdmin.constant');
const companyDAO = require('../../dao/superAdmin/company.dao');
const { STATUS } = require('../../utils/status.utils');
const bcrypt = require('bcrypt');

const signup = async (req, res) => {
  const superAdmin = req.body;
  console.log(superAdmin);
  try {
    const existingCompany = await companyDAO.findOne({ 'company.email': superAdmin.company.email })
    if (existingCompany) {
      return res.status(STATUS.BAD_REQUEST).json({ message: 'Email already registered' })
    }

    await companyDAO.insertOne( {...superAdmin});

    res.status(STATUS.CREATED).json({ message: 'Signup successful' })
  } catch (error) {
    console.error(error)
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' })
  }
}
const login = async (req, res) => {
  const company = req.query;
  try {
    const existingCompany = await companyDAO.findOne({ 'company.email': company.email, type: ROLE.SUPER_ADMIN, status: ROLE_STATUS.ACTIVE });
    if (!existingCompany) {
      return res.status(STATUS.BAD_REQUEST).json({ message: 'Company not found' });
    }
    const passwordMatch = await bcrypt.compare(company.password, existingCompany.password);
    if (!passwordMatch) {
      return res.status(STATUS.BAD_REQUEST).json({ message: 'Incorrect password' });
    }
    res.status(STATUS.OK).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

module.exports = {
  signup,
  login
}
