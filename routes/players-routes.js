const express = require('express');
const { check } = require('express-validator');

const playersControllers = require('../controllers/players-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:playerId', playersControllers.getPlayerById);

router.get('/', playersControllers.getPlayers);

router.use(checkAuth);

router.post(
  '/',
  [
    check('firstName')
      .not()
      .isEmpty(),
    check('lastName')
      .not()
      .isEmpty()
  ],
  playersControllers.createPlayer
);

module.exports = router;
