const express = require('express')
const signatureController = require('../controllers/signature')

const router = express.Router()
router.post('/compare', signatureController.compare);
module.exports = router;
