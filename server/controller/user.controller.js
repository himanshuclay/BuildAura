const bcrypt = require('bcryptjs')
const userDAO = require('../dao/user.dao')

const signup = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    const existingUser = await userDAO.findUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await userDAO.createUser({ name, email, password: hashedPassword })

    res.status(201).json({ message: 'Signup successful' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  signup
}
