const express = require('express');
const router = express.Router();
const employeeRoutes = require('./employee');
const path = require('path')

router.use('/employee', employeeRoutes);
// router.use('/uploads', express.static(path.join(__dirname, 'uploads')));
module.exports = router;