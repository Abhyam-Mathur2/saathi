const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');

router.get('/', orgController.listOrgs);
router.post('/', orgController.createOrg);
router.get('/city/:cityName', orgController.getOrgsByCity);
router.get('/:id', orgController.getOrg);

module.exports = router;
