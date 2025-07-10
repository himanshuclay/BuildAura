const express = require('express');
const router = express.Router();
const authRoutes = require('./user.routes');

router.use('/authentication', authRoutes);

module.exports = router;
