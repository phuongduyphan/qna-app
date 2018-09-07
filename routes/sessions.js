const express = require('express');

const router = express.Router();
const SessionController = require('../src/Controller/SessionController');

router.get('/', SessionController.session_get);
router.post('/', SessionController.session_post);

router.get('/:sessionId', SessionController.sessionId_get);

module.exports = router;
