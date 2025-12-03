const express = require('express');
const router = express.Router();
const upgradeController = require('../controllers/upgradeController');

// Upgrade user plan with wallet deduction
router.post('/', upgradeController.upgradePlan);

// Get list of pro members
router.get('/pro-members', upgradeController.getProMembers);

module.exports = router;