const express = require('express')
const router = express.Router()
const companyController = require('../../controller/superAdmin/company.controller')

router.post('/signup', companyController.signup);
router.get('/login', companyController.login);

module.exports = router
