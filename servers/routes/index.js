const path = require('path');
const express = require('express');
const router = express.Router();
const employeeRoutes = require('./employee');
const signatureRoutes = require('./signature');

router.use('/employee', employeeRoutes);
router.use('/signature', signatureRoutes);

module.exports = router;