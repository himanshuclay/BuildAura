const express = require('express')
const multer = require('multer')
const path = require('path')
const employeeController = require('../controllers/employee')

const router = express.Router()

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')) // make sure /uploads exists
  },
  filename: (req, file, cb) => {
    // generate unique file name
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueName + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// route: /api/employee/save
router.post('/save', upload.single('signature'), employeeController.save);
router.get('/fetch', employeeController.fetch);

module.exports = router
