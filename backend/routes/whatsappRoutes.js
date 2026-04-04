const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

router.post('/webhook', whatsappController.webhook);
router.post('/send', whatsappController.sendMessage);

module.exports = router;
