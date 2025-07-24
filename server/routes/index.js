const express = require('express');
const router = express.Router();
const companyRoutes = require('./superAdmin/company.routes');

router.use('/superAdmin', companyRoutes);
// router.use('/company', companyRoutes);

module.exports = router;
