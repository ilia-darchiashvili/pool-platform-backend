const express = require('express');
const { check } = require('express-validator');

const matchesControllers = require('../controllers/matches-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', matchesControllers.getAllMatches);
router.get('/players/:player1Id/:player2Id', matchesControllers.getMatches);

router.get('/:matchId', matchesControllers.getMatchById);

router.use(checkAuth);

router.post(
  '/',
  [
    check('tournamentName')
      .not()
      .isEmpty(),
    check('player1Id')
      .not()
      .isEmpty(),
    check('player2Id')
      .not()
      .isEmpty(),
    check('date')
      .not()
      .isEmpty()
  ],
  matchesControllers.createMatch
);

router.delete('/:matchId', matchesControllers.deleteMatch);

router.patch('/:matchId', matchesControllers.updateMatch);

module.exports = router;
